import fs from 'fs';
import _ from 'lodash';
import minimist from 'minimist';
import path from 'path';
import { downloadMangaNew } from './downloader';
import { fetchByID, IMangaInfo } from './sites';
import { dateToString, parseArgs, rmR } from './utils';

// Detect Ctrl-C
process.on('SIGINT', () => {
    console.log('Caught interrupt signal');
    process.exit();
});

const now = dateToString();

// GLOBALS
const CONTAINER_DIR = process.env.MANGA_DIR || process.cwd() + '/manga';

const DOWNLOAD_DIR = path.join(CONTAINER_DIR, '.data');
const LINK_DIR = path.join(CONTAINER_DIR, `${now}`);

//
// Parse Args
//

const args = minimist(process.argv.slice(2));
console.log(args._);

//
// Perprocess
//

const { mangaId, mangaType } = parseArgs(args._);
console.log('Manga Id:', mangaId);

const downloadDirPath = path.join(
    DOWNLOAD_DIR,
    mangaType,
    String(Math.floor(parseInt(mangaId, 10) / 1000)),
    mangaId,
);
console.log('Saving to: ' + downloadDirPath);

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
    const info = JSON.parse(fs.readFileSync(downloadDirPath + '/info.json', { encoding: 'utf8' })) as any as IMangaInfo;
    if (!fs.existsSync(getLinkPath(info))) {
        makeLink(info);
    }
    throw new Error('Manga allready exists');
}

// Lock manga
fs.mkdirSync(downloadDirPath, { recursive: true });
let success = false;
process.on('exit', () => {
    if (!success) {
        console.log('Deleting lock');
        rmR(downloadDirPath);
    }
});

// Start
(async () => {
    const manga = await fetchByID(mangaId, mangaType);

    await downloadMangaNew(manga, downloadDirPath);
    await new Promise((res, rej) =>
        fs.writeFile(downloadDirPath + '/info.json', JSON.stringify(manga.info, null, 2),
            (err) => { if (err) { return rej(err); } res(); },
        ));

    makeLink(manga.info);

    success = true;
})();
