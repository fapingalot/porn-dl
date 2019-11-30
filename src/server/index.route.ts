import { Router, RequestHandler } from 'express';
import Joi from 'joi';
import _ from 'lodash';
import path from 'path';
import { download, fsExists, fsMkdir, fsSymlink, rmR, writeInfo } from '../downloader';
import { fetchContent, IContent } from '../sites';
import { dateToString, zpad } from '../utils';
import { validateBody, validateQuery } from './helpers/validate.middleware';
import environment from './environment';
import { NotAuthrorized } from './helpers/genric-error';

//
// Router
//

const app = Router();

//
// Route/s
//

const CONTAINER_DIR = process.env.MANGA_DIR || process.cwd() + '/manga';
const DOWNLOAD_DIR = path.join(CONTAINER_DIR, '.data');
const LINK_DIR = path.join(CONTAINER_DIR, `${dateToString()}`);

const getLinkPath = (data: IContent) => {
    const linkDirName = `[${data.src.replace(/\//g, '')}] `
        + data.title
            .replace(/[\/\\]/g, '')
            .replace(/%20/g, '_')
            .trim();
    return path.join(LINK_DIR, linkDirName);
};

const makeLink = async (info: IContent, downloadDirPath: string) => {
    const linkPath = getLinkPath(info);

    if (!await fsExists(LINK_DIR)) { await fsMkdir(LINK_DIR, { recursive: true }); }

    if (await fsExists(linkPath)) { throw new Error('Link already exists'); }
    await fsSymlink(path.relative(LINK_DIR, downloadDirPath), linkPath, 'dir');
};

const openPage = async (info: IContent, downloadDirPath: string) => {
    const startCmd = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');

    for (const ext of ['jpg', 'jpeg', 'png', 'mp4', 'webm', 'gif']) {
        const firstPath = downloadDirPath + `/${zpad(1, String(info.contentURLs.length).length)}.${ext}`;
        if (!(await fsExists(firstPath))) { continue; }

        // tslint:disable-next-line: no-var-requires
        require('child_process').exec(startCmd + ' ' + firstPath);
        break;
    }
};

app.get('/health/alive', (req, res) => res.send('OK'));

const apiKeyMiddleware: RequestHandler[] = !environment.API_SECRET ? [] : [
    validateQuery(Joi.object({
        apiKey: Joi.string().min(8).required(),
    }).required()),
    (req, res, next) => {
        if (
            req.body.apiKey === environment.API_KEY
            && req.body.apiSecret === environment.API_SECRET
        ) { return next(); }

        return next(new NotAuthrorized());
    },
];

app.post('/',
    ...apiKeyMiddleware,
    validateBody(Joi.array().items(Joi.object({
        url: Joi.string().uri({ scheme: ['http', 'https'] }),
        open: Joi.boolean().default(false),
    }), Joi.any().strip())), async (req, res) => {

        const data: Array<{ url: string, open: boolean }> = req.body;

        res.json(
            await Promise.all(
                data.map(({ url, open }) =>
                    fetchContent(url)
                        .then(async (content) => {
                            const downloadDirPath = path.join(
                                DOWNLOAD_DIR,
                                content.src,
                                !isNaN(parseInt(content.id, 10)) ? String(Math.floor(parseInt(content.id, 10) / 1000)) : '',
                                content.id,
                            );

                            if (await fsExists(downloadDirPath)) {
                                if (!(await fsExists(getLinkPath(content)))) {
                                    await makeLink(content, downloadDirPath);
                                }

                                if (open) { await openPage(content, downloadDirPath); }
                                throw new Error('Manga allready exists');
                            }
                            try {
                                await download(content, downloadDirPath);
                                await writeInfo(content, downloadDirPath);

                                await makeLink(content, downloadDirPath);
                                if (open) { await openPage(content, downloadDirPath); }
                            } catch (err) {
                                await rmR(downloadDirPath);

                                throw err;
                            }

                            return { success: true, name: content.title };
                        })
                        .catch(async (err) => { console.error(err); throw err; })
                        .catch((err) => ({ success: false, name: err.message })),
                ),
            ),
        );
    });

//
// Default export
//

export default app;
