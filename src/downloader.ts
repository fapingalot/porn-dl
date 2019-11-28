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

export const downloadMangaNew = async (manga: Manga, downloadPath: string, ariaOptions: Aria2Options = {}) => {
    //
    // TODO Que
    //

    const toDO: { [gid: string]: boolean } = {};
    const tryPNG: { [gid: string]: { url: string, out: string } } = {};

    //
    // New connection
    //

    const aria2 = new Aria2(ariaOptions);
    await aria2.open();

    //
    //
    //

    let error = false;
    await new Promise<void>(async (res, rej) => {
        const pages = manga.getPageURLs();

        // Create Download data
        const callJPG = pages
            .map((url, i) =>
                ({ url, out: pageDistPath(i, manga.info.pageCount, url.substr(url.lastIndexOf('.') + 1)) }),
            )
            .map(({ url, out }) => ['addUri', [url], { dir: downloadPath, out }] as Aria2Call);

        // Start download
        await Promise.all((await aria2.batch(callJPG)).map((p, i) => p.then((gid) => {
            toDO[gid] = true; // Add to que
            // Add fail fallback
            tryPNG[gid] = {
                url: nextExtension(callJPG[i][1][0]),
                out: nextExtension(callJPG[i][2].out),
            };
        })));

        // Handle completes
        aria2.on('onDownloadComplete', ([{ gid }]) => {
            if (toDO[gid]) { delete toDO[gid]; }
            if (tryPNG[gid]) { delete tryPNG[gid]; }

            if (_.isEmpty(toDO)) { res(); }
        });

        // Handle errors
        aria2.on('onDownloadError', ([{ gid }]) => {
            if (toDO[gid]) { delete toDO[gid]; }
            if (tryPNG[gid]) {
                console.log('JPEG not found trying PNG');

                aria2.call(
                    'addUri',
                    [tryPNG[gid].url],
                    { dir: downloadPath, out: tryPNG[gid].out },
                ).then((newGid) => {
                    toDO[newGid] = true;
                    delete tryPNG[newGid];
                });
            } else {
                error = true;
                console.log('Failed to download pic');
            }
            if (_.isEmpty(toDO)) { res(); }
        });
    });

    //
    // Close on finish
    //
    await aria2.close();

    if (error) { throw Error('Failed to completely download manga'); }
};
