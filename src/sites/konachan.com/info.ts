import cheerio from 'cheerio';
import _ from 'lodash';
import fetch from 'node-fetch';
import { ContentType, IPicture, IVideo } from '..';

//
// Info
//

export const SRC = 'konachan.com';
export type OContent = IPicture | IVideo;

//
// Info
//

export const genInfoURL = (mangaId: string) =>
    `https://konachan.com/post/show/${mangaId}`;

export const fetchByID = async (mangaId: string): Promise<OContent> =>
    fetchByURL(genInfoURL(mangaId), mangaId);

export const fetchByURL = async (url: string, mangaId: string): Promise<OContent> =>
    fromHTML(await (await fetch(url)).text(), mangaId);

export const fromHTML = (html: string, mangaId: string) =>
    fromCheerioStatic(cheerio.load(html), mangaId);

export const fromCheerioStatic = ($: CheerioStatic, mangaId: string): OContent => {
    const contentURLs = [[
        $('a.original-file-unchanged#png').attr('href'),
        $('a.original-file-changed#highres').attr('href'),
        $('img#image').attr('src'),
    ]]
        .map((urls) => urls.filter((url) => url && url.length !== 0).map((url) => url.trim()))
        .filter((url) => url.length !== 0);
    if (contentURLs.length === 0) { throw new Error('There is not content'); }

    const copyrights = $('#tag-sidebar > .tag-type-copyright > a:not(:contains(\'?\'))')
        .map((i, el) => $(el).text().trim()).get();
    const characters = $('#tag-sidebar > .tag-type-character > a:not(:contains(\'?\'))')
        .map((i, el) => $(el).text().trim()).get();
    const artists = $('#tag-sidebar > .tag-type-artist > a:not(:contains(\'?\'))')
        .map((i, el) => $(el).text().trim()).get();
    const styles = $('#tag-sidebar > .tag-type-style > a:not(:contains(\'?\'))')
        .map((i, el) => $(el).text().trim()).get();
    const tags = $('#tag-sidebar > .tag-type-general > a:not(:contains(\'?\'))')
        .map((i, el) => $(el).text().trim()).get();

    return {
        src: SRC,

        type: ContentType.Picture,
        id: mangaId,
        title: String(mangaId),

        contentURLs,

        extra: {
            copyrights,
            characters,
            artists,
            styles,
            tags,
        },
    };
};

//
// URL Helper
//

export const URL_REGEX = /^https?:\/\/konachan\.com\/post\/show\/(\d+).*/i;
export const getIdFromURL = (url: string): string => {
    if (!_.isString(url)) { throw new Error('URL must be a String'); }

    const match = URL_REGEX.exec(url);
    if (!match) {
        throw new Error('Invalid URL Format (eg. https://konachan.com/post/show/295186 )');
    }

    return match[1];
};
