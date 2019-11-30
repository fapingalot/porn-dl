import Aria2, { Aria2Call } from 'aria2';
import fs, { PathLike } from 'fs';
import _ from 'lodash';
import { join as pathJoin } from 'path';
import { parse as parseURL } from 'url';
import { promisify } from 'util';
import { zpad } from '../../src/utils';
import { IContent } from '../sites';

//
// Promisify
//
export const fsWrite = promisify(fs.writeFile);
export const fsExists = promisify(fs.exists);
export const fsMkdir = promisify(fs.mkdir);
export const fsSymlink = promisify(fs.symlink);
export const fsLstat = promisify(fs.lstat);
export const fsUnlink = promisify(fs.unlink);
export const fsReaddir = promisify(fs.readdir);
export const fsRmdir = promisify(fs.rmdir);

export const rmR = async (path: PathLike): Promise<void> => {
    if (await fsExists(path)) {
        await Promise.all((await fsReaddir(path)).map(async (file, index) => {
            const curPath = path + '/' + file;
            if ((await fsLstat(curPath)).isDirectory()) {
                // recurse
                await rmR(curPath);
            } else {
                // delete file
                await fsUnlink(curPath);
            }
        }));
        await fsRmdir(path);
    }
};

//
// Downloader
//

export const DEFAULT_PATH = (url: string, content: IContent, i: number) => {
    const urlPath = parseURL(url, false).pathname as string;
    const ext = urlPath.substr(urlPath.lastIndexOf('.')); // Includes the dot
    return zpad(i + 1, String(content.contentURLs.length).length) + ext;
};

//
// Helpers
//

export const writeInfo = async (data: IContent, downloadPath: string, out: string = 'info.json') =>
    await fsWrite(
        pathJoin(downloadPath, out),
        JSON.stringify(_.omit(data, 'contentURLs'), null, 2), // Remove contentURLs
        { encoding: 'utf8' },
    );

export const download = async (
    content: IContent,
    downloadDir: string,
    fileName: (url: string, content: IContent, i: number) => string = DEFAULT_PATH,
) => {
    const aria2 = new Aria2({});
    await aria2.open();

    await new Promise(async (res, rej) => {
        const downloadGids = (await aria2.multicall(
            content.contentURLs
                .filter(([url]) => url !== null || url !== undefined)
                .map(([url]) => url)
                .map((url, i) => [
                    'addUri',
                    [url],
                    {
                        dir: downloadDir,
                        out: fileName(url, content, i),
                    },
                ] as Aria2Call),
        )).reduce((agg, [gid], i) => ({ ...agg, [gid]: i }), {} as { [key: string]: number });

        // Fallback handler
        const fallback: { [key: string]: true } = {};

        aria2.on('onDownloadError', async ([{ gid }]) => {
            const i = downloadGids[gid];
            // console.log(`Failed ${gid}, ${i}`);

            if (i) {
                const url = content.contentURLs[i][1];
                if (url) {
                    // console.log(`Fallback ${url}`);
                    const fallbackGid = await aria2.call(
                        'addUri',
                        [url],
                        {
                            dir: downloadDir,
                            out: fileName(url, content, i),
                        },
                    );
                    fallback[fallbackGid] = true;
                }

                delete downloadGids[gid];
            } else if (fallback[gid] !== undefined) {
                delete fallback[gid];
            }
            if (_.isEmpty(fallback) && _.isEmpty(downloadGids)) { return res(); }
        });

        aria2.on('onDownloadComplete', async ([{ gid }]) => {
            if (downloadGids[gid] !== undefined) {
                delete downloadGids[gid];
            } else if (fallback[gid] !== undefined) {
                delete fallback[gid];
            }

            if (_.isEmpty(fallback) && _.isEmpty(downloadGids)) { return res(); }
        });
    });

    await aria2.close();
};
