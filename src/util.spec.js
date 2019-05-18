describe('#zpad', () => {
  const { zpad } = require('./util.js');

  it('Test valid params', () => {
    expect(zpad(1, 2)).toBe('01');
    expect(zpad(1, 3)).toBe('001');
    expect(zpad(10, 3)).toBe('010');
  });
});

describe('#download', () => {
  const { download } = require('./util.js');

  it('Test valid', async () => {
    const request = uri => {
      expect(uri).toBe('some url');
      return {
        pipe: stream => {
          expect(stream).toBe('fs stream');

          return {
            on: (type, cb) => {
              expect(type).toBe('error');

              return {
                on: (type, cb) => {
                  expect(type).toBe('close');
                  cb();
                }
              };
            }
          };
        }
      };
    };
    request.head = (url, callback) => {
      expect(url).toBe('some url');
      callback(null, {
        headers: {
          'content-type': 'image/jpg',
          'content-length': 1234
        }
      });
    };

    const fs = {
      createWriteStream: path => {
        expect(path).toBe('some path');

        return 'fs stream';
      }
    };

    await download('some url', 'some path', request, fs);
  });

  it('test download failed', async () => {
    const request = uri => {};
    request.head = (url, callback) => {
      expect(url).toBe('some url');
      callback('Some error');
    };

    const fs = {};

    expect(download('some url', 'some path', request, fs)).rejects.toBe('Some error');
  });
});
