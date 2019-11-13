// 3rd Party deps
const _fetch = require("node-fetch");
const { JSDOM: _JSDOM } = require("jsdom");
const _fs = require("fs");
const { download: _download } = require("./util");

const { PromisePool } = require("./pool");

// Parse
const _ = require("lodash");
const path = require("path");
const { zpad } = require("./util");

const HENTAI_FOX_URL_REGEX = /^https?:\/\/hentaifox\.com\/(g|gallery)\/(\d+).*/i;
const parseHFURL = url => {
  if (!_.isString(url)) throw new Error("URL must be a String");

  const match = HENTAI_FOX_URL_REGEX.exec(url);
  if (!match)
    throw new Error(
      "Invalid URL Format (eg. https://hentaifox.com/gallery/3838830/ )"
    );

  return match[2];
};

const parseArgs = args => {
  if (!args || !args.length) throw new Error("Invalid number of args");

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
const SELECTOR_MANGA_TITLE = ".info > h1:nth-child(1)";
const SELECTOR_MANGA_PAGE_COUNT = ".pages";
const SELECTOR_MANGA_IMAGE_URL_BASE = ".cover > img:nth-child(1)";

const SELECTOR_MANGA_PARODIES = ".info > ul.parodies > li > a";
const SELECTOR_MANGA_CHARACTERS = ".info > ul.characters > li > a";
const SELECTOR_MANGA_TAGS = ".info > ul.tags > li > a";
const SELECTOR_MANGA_ARTISTS = ".info > ul.artists > li > a";
const SELECTOR_MANGA_GROUPS = ".info > ul.groups > li > a";
const SELECTOR_MANGA_LANGUAGES = ".info > ul.languages > li > a";
const SELECTOR_MANGA_CATEGORIES = ".info > ul.categories > li > a";

const parseTagContainer = ($$, tagsSelector) => {
  let res = [];
  for (let tag of $$(tagsSelector)) {
    tag.removeChild(tag.lastChild);
    let text = _.get(tag, "textContent");
    if (text) text = text.trim();
    res.push(text);
  }
  return res;
};

const parsePageCount = pageCountText =>
  _.isString(pageCountText) &&
  pageCountText.length > 7 &&
  pageCountText.startsWith("Pages: ")
    ? parseInt(pageCountText.substr(7)) || undefined
    : undefined;

const IMAGE_URL_BASE_REGEX = /^([\d\w\.-]+\/\d+\/\d+)\/?/;
const parseImageURLBase = pageURLBaseText =>
  _.isString(pageURLBaseText) && pageURLBaseText.length > 0
    ? _.get(IMAGE_URL_BASE_REGEX.exec(pageURLBaseText.substr(8)), "[1]")
    : undefined;

const getGalleryPageInfo = (page, mangaId) => {
  const $ = selector => page.window.document.querySelector(selector);
  const $$ = selector => page.window.document.querySelectorAll(selector);

  const title = _.get($(SELECTOR_MANGA_TITLE), "textContent");

  const parodies = parseTagContainer($$, SELECTOR_MANGA_PARODIES);
  const characters = parseTagContainer($$, SELECTOR_MANGA_CHARACTERS);
  const tags = parseTagContainer($$, SELECTOR_MANGA_TAGS);
  const artists = parseTagContainer($$, SELECTOR_MANGA_ARTISTS);
  const groups = parseTagContainer($$, SELECTOR_MANGA_GROUPS);
  const languages = parseTagContainer($$, SELECTOR_MANGA_LANGUAGES);
  const categories = parseTagContainer($$, SELECTOR_MANGA_CATEGORIES);

  const pageCountText = _.get($(SELECTOR_MANGA_PAGE_COUNT), "textContent");
  const pageCount = parsePageCount(pageCountText);
  if (!pageCount) throw new Error("Page Count is invalid");

  const imageBaseURLText = _.get($(SELECTOR_MANGA_IMAGE_URL_BASE), "src");

  return {
    mangaId,
    title,
    parodies,
    characters,
    tags,
    artists,
    groups,
    languages,
    categories,
    pageCount,

    imageBaseURL: parseImageURLBase(imageBaseURLText)
  };
};

const downloadPages = async (info, dir, download = _download, fs = _fs) => {
  let i = 0;
  return new PromisePool(() => {
    while (i < info.pageCount) {
      i++;

      const fileName = zpad(i, String(info.pageCount).length) + ".jpg";
      const filePath = path.join(dir, fileName);

      if (!fs.existsSync(filePath)) {
        const url = `https://${info.imageBaseURL}/${i}.jpg`;
        console.log(`[${i}/${info.pageCount}] ${url}`);
        return download(url, filePath);
      }
    }
    return null;
  }).start();
};

// Exports
module.exports = {
  parseHFURL,
  parseArgs,
  getGalleryPageURL,
  getGalleryPage,

  // Gallery Info Parsers
  parseTagContainer,
  parsePageCount,
  parseImageURLBase,
  // END

  SELECTOR_MANGA_TITLE,
  SELECTOR_MANGA_IMAGE_URL_BASE,
  SELECTOR_MANGA_PAGE_COUNT,

  SELECTOR_MANGA_PARODIES,
  SELECTOR_MANGA_CHARACTERS,
  SELECTOR_MANGA_TAGS,
  SELECTOR_MANGA_ARTISTS,
  SELECTOR_MANGA_GROUPS,
  SELECTOR_MANGA_LANGUAGES,
  SELECTOR_MANGA_CATEGORIES,
  

  getGalleryPageInfo,
  downloadPages
};
