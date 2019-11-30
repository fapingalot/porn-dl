import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { downloadMangaNew } from './downloader';
import { fetchByID, getInfoFromURL, IMangaInfo, MangaType } from './sites';
import { dateToString, rmR, zpad } from './utils';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', async (req, res) => {
    const CONTAINER_DIR = process.env.MANGA_DIR || process.cwd() + '/manga';
    const DOWNLOAD_DIR = path.join(CONTAINER_DIR, '.data');
    const LINK_DIR = path.join(CONTAINER_DIR, `${dateToString()}`);

    const outPromises = (req.body as any[])
        .map(({ url, title }: { url: string, title: string }) => getInfoFromURL(url))
        .filter((data: any) => data !== null)
        .map(async ({ mangaId, mangaType }: { mangaId: string, mangaType: MangaType }) => {
            const downloadDirPath = path.join(
                DOWNLOAD_DIR,
                mangaType,
                String(Math.floor(parseInt(mangaId, 10) / 1000)),
                mangaId,
            );

            const openPage = (info: IMangaInfo) => {
                const startCmd = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
                // tslint:disable-next-line: no-var-requires
                require('child_process').exec(startCmd + ' ' + downloadDirPath + `/${zpad(1, String(info.pageCount).length)}.jpg`);
                // tslint:disable-next-line: no-var-requires
                require('child_process').exec(startCmd + ' ' + downloadDirPath + `/${zpad(1, String(info.pageCount).length)}.png`);
            };

            let success = true;
            try {
                const getLinkPath = (info: IMangaInfo) => {
                    const linkDirName = `[${mangaType}] `
                        + info.title
                            .replace(/[\/\\]/g, '')
                            .replace(/%20/g, '_')
                            .trim();
                    return path.join(LINK_DIR, linkDirName);
                };
                const makeLink = (info: IMangaInfo) => {
                    const linkPath = getLinkPath(info);

                    if (!fs.existsSync(LINK_DIR)) { fs.mkdirSync(LINK_DIR, { recursive: true }); }

                    if (fs.existsSync(linkPath)) { throw new Error('Link already exists'); }
                    fs.symlinkSync(path.relative(LINK_DIR, downloadDirPath), linkPath, 'dir');
                };

                // Test existance
                if (fs.existsSync(downloadDirPath)) {
                    const info = JSON.parse(fs.readFileSync(
                        downloadDirPath + '/info.json',
                        { encoding: 'utf8' }),
                    ) as any as IMangaInfo;
                    if (!fs.existsSync(getLinkPath(info))) {
                        makeLink(info);
                    }

                    openPage(info);

                    throw new Error('Manga allready exists');
                }
                success = false;

                // Lock manga
                fs.mkdirSync(downloadDirPath, { recursive: true });

                // Start
                const manga = await fetchByID(mangaId, mangaType);

                await downloadMangaNew(manga, downloadDirPath);
                await new Promise((respocnse, rej) =>
                    fs.writeFile(downloadDirPath + '/info.json', JSON.stringify(manga.info, null, 2),
                        (err) => { if (err) { return rej(err); } respocnse(); },
                    ));

                makeLink(manga.info);

                function getCommandLine() {
                    switch (process.platform) {
                        case 'darwin':
                            return 'open';
                        default:
                            return 'xdg-open';
                    }
                }

                function openFileWithDefaultApp(file: string) {
                    /^win/.test(process.platform) ?
                        require('child_process').exec('start "" "' + file + '"') :
                        require('child_process').spawn(getCommandLine(), [file],
                            { detached: true, stdio: 'ignore' }).unref();
                }

                openPage(manga.info);

                success = true;
                return { success: true, name: manga.info.title };
            } catch (e) {
                console.error(e);
                if (!success && fs.existsSync(downloadDirPath)) {
                    console.log('Deleting lock');
                    rmR(downloadDirPath);
                }

                return { success: false };
            }
        });
    res.json(await Promise.all(outPromises));
});

const PORT = parseInt(process.env.PORT || '', 10) || 8080;
app.listen(PORT, () => { console.log(`Listening on http://localhost:${PORT}`); });
