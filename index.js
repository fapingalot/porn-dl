const {
  parseArgs,
  getGalleryPage,
  getGalleryPageInfo,
  downloadPages
} = require('./src/lib');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// GLOBALS
const TMP_DIR = process.cwd();
const DOWNLOAD_DIR = path.join(process.cwd(), 'manga');
const LINK_DIR = path.join(DOWNLOAD_DIR, '.name');

//
// Parse Args
//

const args = require('minimist')(process.argv.slice(2));
console.log(args._);

const { mangaId } = parseArgs(args._);
console.log('Manga Id:', mangaId);

const downloadDirPath = path.join(DOWNLOAD_DIR, mangaId);

// Test existance
if (fs.existsSync(downloadDirPath)) throw new Error('Manga allready exists');

(async () => {
  //
  // Get Manga Info
  //

  console.log('Fetching page ...');
  const page = await getGalleryPage(mangaId);
  console.log('Got Page!');

  const info = getGalleryPageInfo(page, mangaId);
  console.log('Manga info:', info);

  //
  // Save Info
  //

  const tmpDir = path.join(
    TMP_DIR,
    '.tmp.' +
      crypto
        .randomBytes(20)
        .toString('base64')
        .replace(/\//g, '-')
  );

  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  fs.writeFileSync(
    tmpDir + '/info.json',
    JSON.stringify(info, null, 2),
    'utf8'
  );

  //
  // Download
  //

  await downloadPages(info, tmpDir);

  //
  // Move
  //

  if (!fs.existsSync(DOWNLOAD_DIR))
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  fs.renameSync(tmpDir, downloadDirPath);

  //
  // System Link
  //

  const linkDirName = info.title
    .replace(/[\/\\]/g, '')
    .replace(/%20/g, '_')
    .trim();
  const linkPath = path.join(LINK_DIR, linkDirName);

  if (!fs.existsSync(LINK_DIR)) fs.mkdirSync(LINK_DIR, { recursive: true });

  if (fs.existsSync(linkPath)) throw new Error('Link already exists');
  fs.symlinkSync(path.relative(LINK_DIR, downloadDirPath), linkPath, 'dir');
})();
