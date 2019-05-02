const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const request = require('request');
const path = require('path');

var download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback);
  });
};

function zpad(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

const URL_FORMAT = /^(https?:\/\/hentaifox\.com\/gallery\/(\d+)\/?)/;
const IMAGES_URL = /^([\d\w\.-]+\/\d+\/\d+)\/?/;

const args = require('minimist')(process.argv.slice(2));
console.log(args);

if (args._.length == 0) {
  // Help
  return console.log(`<url>`);
}

const url = args._[0];
console.log('Scraping: ' + url);

const urlMatch = URL_FORMAT.exec(url);
if (!urlMatch) return console.log('Invalid URL');
const mangaID = urlMatch[2];
const fetchURL = urlMatch[1];

console.log('Manga id:' + mangaID);

(async () => {
  console.log('Fetching page...');
  const page = new JSDOM(await (await fetch(fetchURL)).text());
  const $ = selector => page.window.document.querySelector(selector);
  const $$ = selector => page.window.document.querySelectorAll(selector);

  // Get Info
  const title = $('div.info > h1').textContent;
  const characters = $('div.info span.characters').textContent.substr(10);
  const tags = $('div.info span.artists:nth-child(4)')
    .textContent.substr(6)
    .split(', ');
  const artists = $('div.info span.artists:nth-child(5)')
    .textContent.substr(9)
    .split(', ');
  const pageCount = parseInt($('.pages').textContent.substr(7));

  const mangaInfo = {
    title,
    characters,
    tags,
    artists,
    pageCount
  };
  console.log('Manga info: ');
  console.log(mangaInfo);

  const parentPath = path.join(__dirname, 'manga', mangaID);
  if (!fs.existsSync(parentPath)) fs.mkdirSync(parentPath, { recursive: true });
  fs.writeFileSync(
    parentPath + '/info.json',
    JSON.stringify(mangaInfo, null, 2),
    'utf8'
  );

  const imagesURL =
    'https://' +
    IMAGES_URL.exec($('.cover > img:nth-child(1)').src.substr(2))[1] +
    '/';
  console.log(imagesURL);

  for (let i = 1; i <= mangaInfo.pageCount; i++) {
    console.log('[' + i + '/' + pageCount + ']');
    await new Promise(res =>
      download(imagesURL + i + '.jpg', parentPath + '/' + zpad(i, String(pageCount).length) + '.jpg', res)
    );
  }
})();
