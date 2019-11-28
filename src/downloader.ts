import Aria2, { Aria2Call, Aria2Options } from 'aria2';
import _ from 'lodash';
import { Manga } from './sites';
import { zpad } from './utils';

//
// Aria download client
//

const pageDistPath = (i: number, pageCount: number, ext: string = 'jpg') =>
    `${zpad(i + 1, String(pageCount).length)}.${ext}`;

const nextExtension = (url: string) => {
    switch (url.substr(url.lastIndexOf('.') + 1)) {
        case 'png': return url.replace(/png$/i, 'jpg');
        case 'jpg': return url.replace(/jpg$/i, 'png');
        default: return url + '.png';
    }
};

export const download = async (url: string, dir: string, out: string, aria2: Aria2) =>
    new Promise<void>(async (res, rej) => {
        const downloadGid = await aria2.call('addUri', [url], { dir, out });
        aria2.on('onDownloadComplete', ([{ gid }]) => { if (gid === downloadGid) { res(); } });
        aria2.on('onDownloadError', ([{ gid }]) => { if (gid === downloadGid) { rej(); } });
    });

export const downloadMangaNew = async (manga: Manga, downloadPath: string, ariaOptions: Aria2Options = {}) => {
    const aria2 = new Aria2(ariaOptions);
    await aria2.open();
    (aria2 as any).setMaxListeners(manga.info.pageCount * 2);

    await Promise.all(
        manga.getPageURLs()
            .map((picURL, i) =>
                download(
                    picURL,
                    downloadPath,
                    pageDistPath(
                        i,
                        manga.info.pageCount,
                        picURL.substr(picURL.lastIndexOf('.') + 1),
                    ),
                    aria2,
                ).catch(() => {
                    console.log('Failed to download Original Downloading fallback');
                    return download(
                        nextExtension(picURL),
                        downloadPath,
                        pageDistPath(
                            i,
                            manga.info.pageCount,
                            nextExtension(picURL.substr(picURL.lastIndexOf('.') + 1)),
                        ),
                        aria2,
                    );
                }).catch(() => console.log(`Failed to download '${picURL}'`)),
            ),
    );

    await aria2.close();
};
