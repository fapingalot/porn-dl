import * as hentaifox from './hentaifox';
import * as nhentai from './nhentai';

export type MangaType = 'hentaifox' | 'nhentai';
export type Manga = hentaifox.Manga | nhentai.Manga;
export type IMangaInfo = hentaifox.IMangaInfo | nhentai.IMangaInfo;

export const getInfoFromURL = (url: string): { mangaId: string, mangaType: MangaType } | null => {
    if (hentaifox.HENTAI_FOX_URL_REGEX.test(url)) {
        return { mangaId: hentaifox.getIdFromURL(url), mangaType: 'hentaifox' };
    }
    if (nhentai.NHENTAI_URL_REGEX.test(url)) {
        return { mangaId: nhentai.getIdFromURL(url), mangaType: 'nhentai' };
    }
    return null;
};
export const parseMangaType = (type: string): MangaType | null => {
    switch (type) {
        case 'hentaifox': return 'hentaifox';
        case 'nhentai': return 'nhentai';
        default: return null;
    }
};

export const fetchByID = (mangaID: string, type: MangaType): Promise<Manga> => {
    switch (type) {
        case 'hentaifox': return hentaifox.fetchByID(mangaID);
        case 'nhentai': return nhentai.fetchByID(mangaID);
    }
};

export { hentaifox, nhentai };
