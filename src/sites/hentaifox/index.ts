import _ from 'lodash';
import * as mangaInfo from './info';

export { IMangaInfo } from './info';

export class Manga {
    //
    // Constructor
    //

    constructor(public info: mangaInfo.IMangaInfo) { }

    //
    // Extra data helpers
    //

    public getPageURLIterator(): () => (string | null) {
        let index = 0;
        return () => (index < this.info.pageCount) ? `https://${this.info.imageBaseURL}/${index++ + 1}.jpg` : null;
    }

    public getPageURLs(): string[] {
        const pages = [];
        for (let i = 0; i < this.info.pageCount; i++) {
            pages.push(`https://${this.info.imageBaseURL}/${i + 1}.jpg`);
        }
        return pages;
    }

}

//
// Helpers
//
export const fetchByID = async (mangaId: string) =>
    new Manga(await mangaInfo.fetchByID(mangaId));

export const fetchByURL = async (url: string, mangaId: string) =>
    new Manga(await mangaInfo.fetchByURL(url, mangaId));

//
// URL Helpers
//

export const HENTAI_FOX_URL_REGEX = /^https?:\/\/hentaifox\.com\/(g|gallery)\/(\d+).*/i;
export const getIdFromURL = (url: string): string => {
    if (!_.isString(url)) { throw new Error('URL must be a String'); }

    const match = HENTAI_FOX_URL_REGEX.exec(url);
    if (!match) {
        throw new Error('Invalid URL Format (eg. https://hentaifox.com/gallery/3838830/ )');
    }

    return match[2];
};