import cheerio from 'cheerio';
import _ from 'lodash';
import fetch from 'node-fetch';
import { ContentType, IManga } from '..';

//
// Info
//

export const SRC = 'hentaifox.com';
export type OContent = IManga;

//
// Base data
//

export const SELECTOR_MANGA_TITLE = '.info > h1:nth-child(1)';
export const SELECTOR_MANGA_PAGE_COUNT = '.pages';
export const SELECTOR_MANGA_IMAGE_URL_BASE = '.cover > img:nth-child(1)';

export const extractPageCount = (text: string): number | null =>
    text.startsWith('Pages: ') ? parseInt(text.substr(7), 10) || null : null;

//
// Tag like containers
//

export const SELECTOR_MANGA_PARODIES = '.info > ul.parodies > li > a';
export const SELECTOR_MANGA_CHARACTERS = '.info > ul.characters > li > a';
export const SELECTOR_MANGA_TAGS = '.info > ul.tags > li > a';
export const SELECTOR_MANGA_ARTISTS = '.info > ul.artists > li > a';
export const SELECTOR_MANGA_GROUPS = '.info > ul.groups > li > a';
export const SELECTOR_MANGA_LANGUAGES = '.info > ul.languages > li > a';
export const SELECTOR_MANGA_CATEGORIES = '.info > ul.categories > li > a';

export const extractTagStrings = ($: CheerioStatic, tagsSelector: string): string[] =>
    $(tagsSelector)
        .map((i, el) =>
            $(el)
                .clone()
                .children()
                .remove()
                .end()
                .text().trim(),
        ).get();

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
    `https://hentaifox.com/gallery/${mangaId}/`;

export const fetchByID = async (mangaId: string): Promise<OContent> =>
    fetchByURL(genInfoURL(mangaId), mangaId);

export const fetchByURL = async (url: string, mangaId: string): Promise<OContent> =>
    fromHTML(await (await fetch(url)).text(), mangaId);

export const fromHTML = (html: string, mangaId: string) =>
    fromCheerioStatic(cheerio.load(html), mangaId);

export const fromCheerioStatic = ($: CheerioStatic, mangaId: string): OContent => {
    // Parse
    const title = $(SELECTOR_MANGA_TITLE).text();
    if (title.trim().length === 0) { throw new Error('Title is null'); }

    const pageCount = extractPageCount($(SELECTOR_MANGA_PAGE_COUNT).text());
    if (!pageCount) { throw new Error('Page count is null'); }

    const imageBaseURL = extractImageBaseURL($(SELECTOR_MANGA_IMAGE_URL_BASE).attr('src'));
    if (!imageBaseURL) { throw new Error('Base image URL is null'); }

    const parodies = extractTagStrings($, SELECTOR_MANGA_PARODIES);
    const characters = extractTagStrings($, SELECTOR_MANGA_CHARACTERS);
    const tags = extractTagStrings($, SELECTOR_MANGA_TAGS);
    const artists = extractTagStrings($, SELECTOR_MANGA_ARTISTS);
    const groups = extractTagStrings($, SELECTOR_MANGA_GROUPS);
    const languages = extractTagStrings($, SELECTOR_MANGA_LANGUAGES);
    const categories = extractTagStrings($, SELECTOR_MANGA_CATEGORIES);

    // TODO add code
    return {
        src: SRC,

        type: ContentType.Manga,
        id: mangaId,
        title,

        pageCount,
        contentURLs: new Array(pageCount)
            .fill(null)
            .map((ignore, i) => [
                'https://' + imageBaseURL + `/${i + 1}.jpg`,
                'https://' + imageBaseURL + `/${i + 1}.png`,
            ]),

        extra: {
            parodies,
            characters,
            tags,
            artists,
            groups,
            languages,
            categories,
        },
    };
};

export const URL_REGEX = /^https?:\/\/hentaifox\.com\/(g|gallery)\/(\d+).*/i;
export const getIdFromURL = (url: string): string => {
    if (!_.isString(url)) { throw new Error('URL must be a String'); }

    const match = URL_REGEX.exec(url);
    if (!match) {
        throw new Error('Invalid URL Format (eg. https://hentaifox.com/gallery/3838830/ )');
    }

    return match[2];
};
