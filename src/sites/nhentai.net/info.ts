import cheerio from 'cheerio';
import _ from 'lodash';
import fetch from 'node-fetch';
import { ContentType, IManga } from '..';

//
// Info
//

export const SRC = 'nhentai.net';
export type OContent = IManga;

//
// Base data
//

export const SELECTOR_MANGA_TITLE = '#info > h1';
export const SELECTOR_MANGA_PAGE_COUNT = '#info > div';
export const SELECTOR_MANGA_IMAGE_URL_BASE = '.cover > img:nth-child(1)';

export const PAGE_COUNT_REGEX = /(\d+)\s+pages/;
export const extractPageCount = (text: string): number | null => {
    const match = PAGE_COUNT_REGEX.exec(text);
    return (match && match[1]) ? parseInt(match[1], 10) : null;
};

//
// Tag like containers
//

export const TAG_CONTAINERS_SELECTOR = '#tags > div.tag-container';
export const TAGS_SELECTOR_SUB = 'span.tags > a.tag';

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
// Page url
//

export const IMAGE_URL_BASE_REGEX = /^([\d\w\.-]+\/\d+\/\d+)\/?/;
export const extractImageBaseURL = (text: string) =>
    _.get(IMAGE_URL_BASE_REGEX.exec(text.substr(8)), '[1]') || null;

//
// Info
//

export const genInfoURL = (mangaId: string) =>
    `https://nhentai.net/g/${mangaId}/`;

export const fetchByID = async (mangaId: string): Promise<OContent> =>
    fetchByURL(genInfoURL(mangaId), mangaId);

export const fetchByURL = async (url: string, mangaId: string): Promise<OContent> =>
    fromHTML(await (await fetch(url)).text(), mangaId);

export const fromHTML = (html: string, mangaId: string) =>
    fromCheerioStatic(cheerio.load(html), mangaId);

export const fromCheerioStatic = ($: CheerioStatic, mangaId: string): OContent => {
    // Parse
    const title = $(SELECTOR_MANGA_TITLE).text().trim();
    if (title.length === 0) { throw new Error('Title is null'); }

    const pageCount = extractPageCount($(SELECTOR_MANGA_PAGE_COUNT).text().trim());
    if (!pageCount) { throw new Error('Page count is null'); }

    const pages = $('#thumbnail-container > div > a > img')
        .map((e, el) =>
            $(el).attr('data-src')
                .replace(/t\.png$/, '.png')
                .replace(/t\.jpg$/, '.jpg')
                .replace(/t\.gif$/, '.gif')
                .replace(/^https:\/\/t/, 'https://i'),
        ).get();

    const tagsContainer = extractTagsFromPage($);

    return {
        src: SRC,

        type: ContentType.Manga,
        id: mangaId,
        title,

        contentURLs: pages.map((page) => [page]),
        pageCount,

        extra: {
            parodies: tagsContainer.parodies || [],
            characters: tagsContainer.characters || [],
            tags: tagsContainer.tags || [],
            artists: tagsContainer.artists || [],
            groups: tagsContainer.groups || [],
            languages: tagsContainer.languages || [],
            categories: tagsContainer.categories || [],
        },
    };
};

//
// URL Helper
//

export const URL_REGEX = /^https?:\/\/nhentai\.net\/(g)\/(\d+).*/i;
export const getIdFromURL = (url: string): string => {
    if (!_.isString(url)) { throw new Error('URL must be a String'); }

    const match = URL_REGEX.exec(url);
    if (!match) {
        throw new Error('Invalid URL Format (eg. https://nhentai.net/g/292230/ )');
    }

    return match[2];
};
