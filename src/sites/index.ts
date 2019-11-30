//
// Base Content
//

export enum ContentType {
    Manga = 'manga',
    Picture = 'picture',
    Video = 'video',
    collection = 'collection',
}

export interface IContentExtra {
    [key: string]: string[];
}

export interface IContent {
    src: string;

    type: ContentType;
    id: string;
    title: string;

    contentURLs: string[][];

    extra: IContentExtra;
}

//
// Picture
//

export interface IPicture extends IContent {
    type: ContentType.Picture;
}

//
// Manga
//

export interface IMangaExtra extends IContentExtra {
    parodies: string[];
    characters: string[];
    tags: string[];
    artists: string[];
    groups: string[];
    languages: string[];
    categories: string[];
}

export interface IManga extends IContent {
    type: ContentType.Manga;

    pageCount: number;

    extra: IMangaExtra;
}

//
// Video
//

export interface IVideo extends IContent {
    type: ContentType.Video;
}

//
// Content Source interface
//

export interface IContentGetter<Content extends IContent = IContent> {
    /**
     * The name of the site (** Probably the URL)
     */
    src: string;

    getFromURL(url: string): Promise<Content>;
    getFromId(id: string): Promise<Content>;

    isValidURL(url: string): boolean;
}

//
// URL to content
//

import directLink from './direct.link';
import hentaiFox from './hentaifox.com';
import konachan from './konachan.com';
import nhentai from './nhentai.net';
import rule34 from './rule34.xxx';
import shadbase from './shadbase.com';
import thatpervert from './thatpervert.com';
import xlecx from './xlecx.com';

export const CONTENT_PROVIDERS: IContentGetter[] = [
    directLink,
    hentaiFox,
    konachan,
    nhentai,
    rule34,
    shadbase,
    thatpervert,
    xlecx,
];
export type ContentProviderType = 'direct.link'
    | 'hentaiFox'
    | 'konachan.com'
    | 'nhentai.net'
    | 'rule34.xxx'
    | 'shadbase.com'
    | 'thatpervert.com'
    | 'xlecx.com'
    ;

export const fetchContent = async (url: string): Promise<IContent> => {
    const provider = CONTENT_PROVIDERS
        .filter((pro) => pro.isValidURL(url))[0];
    if (!provider) { throw new Error('No content provider is avaliable for this URL'); }

    return provider.getFromURL(url);
};

export const fetchContentByID = async (id: string, type: ContentProviderType): Promise<IContent> => {
    const provider = CONTENT_PROVIDERS
        .filter((pro) => pro.src === type)[0];
    if (!provider) { throw new Error('No content provider is avaliable for this type'); }

    return provider.getFromId(id);
};
