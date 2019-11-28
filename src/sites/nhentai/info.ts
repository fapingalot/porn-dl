import cheerio from 'cheerio';
import _ from 'lodash';
import fetch from 'node-fetch';

//
// Base data
//

export const SELECTOR_MANGA_TITLE = '#info > h1';
export const SELECTOR_MANGA_PAGE_COUNT = '#info > div:nth-child(4)';
export const SELECTOR_MANGA_IMAGE_URL_BASE = '.cover > img:nth-child(1)';

export const PAGE_COUNT_REGEX = /^(\d+)\s+pages$/;
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

export interface IMangaInfo {
    mangaId: string;
    title: string;
    parodies: string[];
    characters: string[];
    tags: string[];
    artists: string[];
    groups: string[];
    languages: string[];
    categories: string[];
    pageCount: number;

    pages: string[];
}

export const genInfoURL = (mangaId: string) =>
    `https://nhentai.net/g/${mangaId}/`;

export const fetchByID = async (mangaId: string): Promise<IMangaInfo> =>
    fetchByURL(genInfoURL(mangaId), mangaId);

export const fetchByURL = async (url: string, mangaId: string): Promise<IMangaInfo> =>
    fromHTML(await (await fetch(url)).text(), mangaId);

export const fromHTML = (html: string, mangaId: string) =>
    fromCheerioStatic(cheerio.load(html), mangaId);

export const fromCheerioStatic = ($: CheerioStatic, mangaId: string): IMangaInfo => {
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
                .replace(/^https?:\/\/t/, 'http://i'),
        ).get();

    const tagsContainer = extractTagsFromPage($);

    return {
        mangaId,
        title,
        // tslint:disable-next-line: object-literal-sort-keys
        pageCount,

        parodies: tagsContainer.parodies || [],
        characters: tagsContainer.characters || [],
        tags: tagsContainer.tags || [],
        artists: tagsContainer.artists || [],
        groups: tagsContainer.groups || [],
        languages: tagsContainer.languages || [],
        categories: tagsContainer.categories || [],

        pages,
    };
};
