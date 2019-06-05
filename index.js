const {
  parseArgs,
  getGalleryPage,
  getGalleryPageInfo,
  downloadPages
} = require('./src/lib');
const {
  rmR,
  zpad
} = require('./src/util');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Detect Ctrl-C
process.on('SIGINT', function () {
  console.log("Caught interrupt signal");
  process.exit();
});

const now = ((d) => d.getFullYear() + "-" + zpad(d.getMonth() + 1, 2) + "-" + zpad(d.getDay() + 1, 2))(new Date());
const fileCount = async (folderPath) => new Promise((res, rej) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) return rej(err);
    res(files.length);
  })
});


// GLOBALS
const CONTAINER_DIR = process.env.MANGA_DIR || process.cwd() + "/manga";

const TMP_DIR = CONTAINER_DIR;
const DOWNLOAD_DIR = path.join(CONTAINER_DIR, '.data');
const LINK_DIR = path.join(CONTAINER_DIR, `${now}`);

//
// Parse Args
//

const args = require('minimist')(process.argv.slice(2));
console.log(args._);

const { mangaId } = parseArgs(args._);
console.log('Manga Id:', mangaId);

const downloadDirPath = path.join(DOWNLOAD_DIR, String(Math.floor(mangaId / 1000)), String(mangaId % 1000));

// Test existance
if (fs.existsSync(downloadDirPath)) throw new Error('Manga allready exists');

// Manga lock - Prevent 2 of the same downloads at the same time
let done = false;
fs.mkdirSync(downloadDirPath, { recursive: true });
process.on('exit', function (code) {
  if (!done) {
    console.log("Removing folder lock")
    rmR(downloadDirPath);
  }
});

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
  process.on('exit', function (code) { // Exit remove hook
    if (fs.existsSync(tmpDir)) {
      console.log("Deleting unfinished manga");
      rmR(tmpDir);
    }
  });

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

  // Finish
  done = true;
})();
