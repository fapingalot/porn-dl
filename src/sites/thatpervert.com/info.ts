import cheerio from 'cheerio';
import _ from 'lodash';
import fetch from 'node-fetch';
import { ContentType, IPicture, IVideo } from '..';

//
// Info
//

export const SRC = 'thatpervert.com';
export type OContent = IPicture | IVideo;

//
// Info
//

export const genInfoURL = (mangaId: string) =>
    `http://thatpervert.com/post/${mangaId}`;

export const fetchByID = async (mangaId: string): Promise<OContent> =>
    fetchByURL(genInfoURL(mangaId), mangaId);

export const fetchByURL = async (url: string, mangaId: string): Promise<OContent> =>
    fromHTML(await (await fetch(url)).text(), mangaId);

export const fromHTML = (html: string, mangaId: string) =>
    fromCheerioStatic(cheerio.load(html), mangaId);

export const fromCheerioStatic = ($: CheerioStatic, mangaId: string): OContent => {
    const contentURLs = $('.post_content div.image').map((i, ell) => {
        const el = $(ell);
        return [[
            el.find('a.prettyPhotoLink').attr('href'),
            el.find('a.video_gif_source').attr('href'),

            ...el.find('video > source').map((i2, el2) => $(el2).attr('src')).get(),
            el.find('img').attr('src'),
        ]];
    }).get()
        .map((urls: string[]) => urls.filter((url) => url && url.length).map((url) => url.trim()))
        .filter((urls) => urls.length !== 0);
    if (!contentURLs.length) { throw new Error('There is not content'); }

    const tags = $('strong.taglist > b').map((i, el) => $(el).text().trim()).get();

    return {
        src: SRC,

        type: ContentType.Picture,
        id: mangaId,
        title: String(mangaId),

        contentURLs,

        extra: {
            tags,
        },
    };
};

//
// URL Helper
//

export const URL_REGEX = /^https?:\/\/thatpervert\.com\/post\/(\d+)/i;
export const getIdFromURL = (url: string): string => {
    if (!_.isString(url)) { throw new Error('URL must be a String'); }

    const match = URL_REGEX.exec(url);
    if (!match) {
        throw new Error('Invalid URL Format (eg. http://thatpervert.com/post/4164074 )');
    }

    return match[1];
};
