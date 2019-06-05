// 3rd Party deps
const _fetch = require('node-fetch');
const { JSDOM: _JSDOM } = require('jsdom');
const _fs = require('fs');
const { download: _download } = require('./util');

const { PromisePool } = require('./pool');

// Parse
const _ = require('lodash');
const path = require('path');
const { zpad } = require('./util');

const HENTAI_FOX_URL_REGEX = /^https?:\/\/hentaifox\.com\/(g|gallery)\/(\d+).*/i;
const parseHFURL = url => {
  if (!_.isString(url)) throw new Error('URL must be a String');

  const match = HENTAI_FOX_URL_REGEX.exec(url);
  if (!match)
    throw new Error(
      'Invalid URL Format (eg. https://hentaifox.com/gallery/3838830/ )'
    );

  return match[2];
};

const parseArgs = args => {
  if (!args || !args.length) throw new Error('Invalid number of args');

  // Validate URL
  const url = args[0];
  const mangaId = `${parseInt(url) || parseHFURL(url)}`;

  return {
    mangaId
  };
};

const getGalleryPageURL = mangaId =>
  `https://hentaifox.com/gallery/${mangaId}/`;

const getGalleryPage = async (mangaId, fetch = _fetch, JSDOM = _JSDOM) =>
  new JSDOM(await (await fetch(getGalleryPageURL(mangaId))).text());

// Info
const SELECTOR_MANGA_TITLE = 'div.info > h1';
const SELECTOR_MANGA_CHARACTERS = 'div.info span.characters';
const SELECTOR_MANGA_TAGS = 'div.info span.artists:nth-child(4)';
const SELECTOR_MANGA_ARTISTS = 'div.info span.artists:nth-child(5)';
const SELECTOR_MANGA_PAGE_COUNT = '.pages';
const SELECTOR_MANGA_IMAGE_URL_BASE = '.cover > img:nth-child(1)';

const parseCharacters = charactersText =>
  _.isString(charactersText) && charactersText.length > 10 && charactersText.startsWith("Characters: ")
    ? charactersText.substr(12).split(', ')
    : undefined;

const parseTags = tagsText =>
  _.isString(tagsText) && tagsText.length > 6 && tagsText.startsWith("Tags: ")
    ? tagsText.substr(6).split(', ')
    : undefined;

const parseArtists = artistsText =>
  _.isString(artistsText) && artistsText.length > 9 && artistsText.startsWith("Artists: ")
    ? artistsText.substr(9).split(', ')
    : undefined;

const parsePageCount = pageCountText =>
  _.isString(pageCountText) && pageCountText.length > 7 && pageCountText.startsWith("Pages: ")
    ? parseInt(pageCountText.substr(7)) || undefined
    : undefined;

const IMAGE_URL_BASE_REGEX = /^([\d\w\.-]+\/\d+\/\d+)\/?/;
const parseImageURLBase = pageURLBaseText =>
  _.isString(pageURLBaseText) && pageURLBaseText.length > 0
    ? _.get(IMAGE_URL_BASE_REGEX.exec(pageURLBaseText.substr(2)), '[1]')
    : undefined;

const getGalleryPageInfo = (page, mangaId) => {
  const $ = selector => page.window.document.querySelector(selector);

  const pageCountText = _.get($(SELECTOR_MANGA_PAGE_COUNT), 'textContent');
  const pageCount = parsePageCount(pageCountText);
  if (!pageCount) throw new Error('Page Count is invalid');

  const titleText = _.get($(SELECTOR_MANGA_TITLE), 'textContent');
  const charactersText = _.get($(SELECTOR_MANGA_CHARACTERS), 'textContent');
  const tagsText = _.get($(SELECTOR_MANGA_TAGS), 'textContent');
  const artistsText = _.get($(SELECTOR_MANGA_ARTISTS), 'textContent');

  const imageBaseURLText = _.get($(SELECTOR_MANGA_IMAGE_URL_BASE), 'src');

  return {
    mangaId,
    title: titleText,
    characters: parseCharacters(charactersText) || [],
    tags: parseTags(tagsText) || [],
    artists: parseArtists(artistsText) || [],
    pageCount,

    imageBaseURL: parseImageURLBase(imageBaseURLText)
  };
};

const downloadPages = async (info, dir, download = _download, fs = _fs) => {
  let i = 0;
  return (new PromisePool(() => {
    while (i < info.pageCount) {
      i++;

      const fileName = zpad(i, String(info.pageCount).length) + '.jpg';
      const filePath = path.join(dir, fileName);

      if (!fs.existsSync(filePath)) {
        console.log(`[${i}/${info.pageCount}]`);
        return download(`https://${info.imageBaseURL}/${i}.jpg`, filePath);
      }
    }
    return null;
  })).start();
};

// Exports
module.exports = {
  parseHFURL,
  parseArgs,
  getGalleryPageURL,
  getGalleryPage,

  // Gallery Info Parsers
  parseCharacters,
  parseTags,
  parseArtists,
  parsePageCount,
  parseImageURLBase,
  // END

  SELECTOR_MANGA_TITLE,
  SELECTOR_MANGA_ARTISTS,
  SELECTOR_MANGA_CHARACTERS,
  SELECTOR_MANGA_IMAGE_URL_BASE,
  SELECTOR_MANGA_PAGE_COUNT,
  SELECTOR_MANGA_TAGS,

  getGalleryPageInfo,
  downloadPages
};
