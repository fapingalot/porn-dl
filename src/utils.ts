import fs, { PathLike } from 'fs';
import _ from 'lodash';
import { getInfoFromURL, parseMangaType, MangaType } from './sites';

export const parseArgs = (args: any): { mangaId: string, mangaType: MangaType } => {
    if (!args || !args.length) { throw new Error('Invalid number of args'); }

    // Validate URL
    const url = args[0];
    const type = args[1];

    if (parseInt(url, 10) && !type) {
        throw new Error('If using mangaIds you must specify the type');
    } else if (type) {
        const mangaType = parseMangaType(type);
        if (!mangaType) { throw new Error('Invalid manga type'); }

        return { mangaId: String(url), mangaType };
    }

    const res = getInfoFromURL(url);
    if (!res) { throw new Error('Invalid URL'); }

    return res;
};

export const dateToString = (d: Date = new Date()) =>
    d.getFullYear() +
    '-' +
    zpad(d.getMonth() + 1, 2) +
    '-' +
    zpad(d.getDay() + 1, 2);

export const zpad = (value: number, digits: number): string =>
    Array(Math.max(digits - String(value).length + 1, 0)).join('0') + value;

export const rmR = (path: PathLike): void => {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file, index) => {
            const curPath = path + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                rmR(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
