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
        return () => (index < this.info.pageCount) ? this.info.pages[++index] : null;
    }

    public getPageURLs(): string[] {
        return this.info.pages;
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

export const NHENTAI_URL_REGEX = /^https?:\/\/nhentai\.net\/(g)\/(\d+).*/i;
export const getIdFromURL = (url: string): string => {
    if (!_.isString(url)) { throw new Error('URL must be a String'); }

    const match = NHENTAI_URL_REGEX.exec(url);
    if (!match) {
        throw new Error('Invalid URL Format (eg. https://nhentai.net/g/292230/ )');
    }

    return match[2];
};
