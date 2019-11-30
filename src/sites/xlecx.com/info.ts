import cheerio from 'cheerio';
import _ from 'lodash';
import fetch from 'node-fetch';
import { ContentType, IManga } from '..';

//
// Info
//

export const SRC = 'xlecx.com';
export type OContent = IManga;

//
// Tag like containers
//

export const TAG_CONTAINERS_SELECTOR = '#dle-content > article > div.full-in > div.full-tags';
export const TAGS_SELECTOR_SUB = 'a';

export const extractTagsFromPage = ($: CheerioStatic) => {
    const info: { [key: string]: string[] } = {};
    $(TAG_CONTAINERS_SELECTOR)
        .each((i, el) => {
            const name = $(el)
                .clone()
                .children()
                .remove()
                .end()
                .text().trim().toLocaleLowerCase();

            const values = $(el)
                .find(TAGS_SELECTOR_SUB)
                .map((i2, tag) =>
                    $(tag)
                        .clone()
                        .children()
                        .remove()
                        .end()
                        .text().trim(),
                ).get();
            info[name.substring(0, name.length - 1)] = values;
        });
    return info;
};

//
// Info
//

export const genInfoURL = (mangaId: string) =>
    `https://xlecx.com/${mangaId}.html`;

export const fetchByID = async (mangaId: string): Promise<OContent> =>
    fetchByURL(genInfoURL(mangaId), mangaId);

export const fetchByURL = async (url: string, mangaId: string): Promise<OContent> =>
    fromHTML(await (await fetch(url)).text(), mangaId);

export const fromHTML = (html: string, mangaId: string) =>
    fromCheerioStatic(cheerio.load(html), mangaId);

export const fromCheerioStatic = ($: CheerioStatic, mangaId: string): OContent => {
    const contentURLs = $('.f-desc.full-text.clearfix > div > a').map((i, el) => {
        return [[
            $(el).attr('href'),
        ]];
    }).get()
        .map((urls: string[]) => urls.filter((url) => url && url.length).map((url) => url.trim()))
        .filter((urls) => urls.length !== 0);
    if (!contentURLs.length) { throw new Error('There is not content'); }

    const info = extractTagsFromPage($);

    return {
        src: SRC,

        type: ContentType.Manga,
        id: mangaId,
        title: String(mangaId),

        contentURLs,
        pageCount: contentURLs.length,

        extra: {
            parodies: info.parody || [],
            characters: info.character || [],
            tags: info.tags || [],
            artists: info.artist || [],
            groups: info.group || [],
            languages: info.language || [],
            categories: info.categorie || [],
        },
    };
};

//
// URL Helper
//

export const URL_REGEX = /^https?:\/\/xlecx\.com\/(\d+[a-z0-9\-]+)\.html/i;
export const getIdFromURL = (url: string): string => {
    if (!_.isString(url)) { throw new Error('URL must be a String'); }

    const match = URL_REGEX.exec(url);
    if (!match) {
        throw new Error('Invalid URL Format (eg. https://xlecx.com/7463-shippai-otori-sousa.html )');
    }

    return match[1];
};
