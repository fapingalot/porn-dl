import cheerio from 'cheerio';
import _ from 'lodash';
import fetch from 'node-fetch';
import { ContentType, IPicture } from '..';

//
// Info
//

export const SRC = 'shadbase.com';
export type OContent = IPicture;

//
// Info
//

export const genInfoURL = (mangaId: string) =>
    `http://www.shadbase.com//${mangaId}/`;

export const fetchByID = async (mangaId: string): Promise<OContent> =>
    fetchByURL(genInfoURL(mangaId), mangaId);

export const fetchByURL = async (url: string, mangaId: string): Promise<OContent> =>
    fromHTML(await (await fetch(url)).text(), mangaId);

export const fromHTML = (html: string, mangaId: string) =>
    fromCheerioStatic(cheerio.load(html), mangaId);

export const fromCheerioStatic = ($: CheerioStatic, mangaId: string): OContent => {
    const title = $('title').text().trim().replace(' | Shädbase', '');
    if (title.length === 0) { throw new Error('Title is empty'); }

    const contentURLs = $('#comic > div > img')
        .map((i, el) => [[$(el).attr('src').trim()]])
        .get();
    if (contentURLs.length === 0) { throw new Error('There is not content'); }

    return {
        src: SRC,

        type: ContentType.Picture,
        id: mangaId,
        title,

        contentURLs,

        extra: {},
    };
};

//
// URL Helper
//

export const URL_REGEX = /^https?:\/\/(www\.)?shadbase\.com\/([^\/]+)/i;
export const getIdFromURL = (url: string): string => {
    if (!_.isString(url)) { throw new Error('URL must be a String'); }

    const match = URL_REGEX.exec(url);
    if (!match) {
        throw new Error('Invalid URL Format (eg. http://www.shadbase.com/new-sonic-edits/ )');
    }

    return match[2];
};
