const _request = require('request');
const _fs = require('fs');

const zpad = (number, digits) =>
  Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;

const download = (uri, filename, request = _request, fs = _fs) =>
  new Promise((resolve, reject) => {
    request.head(uri, function (err, res) {
      if (err) return reject(err);

      // console.log('Downloading ' + uri);
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri)
        .pipe(fs.createWriteStream(filename))
        .on('error', reject)
        .on('close', resolve);
    });
  });

const rmR = (path, fs = _fs) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports = {
  zpad,
  download,
  rmR
};
