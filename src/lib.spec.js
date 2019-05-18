console.log = jest.fn();

describe('#parseHFURL', () => {
  const { parseHFURL } = require('./lib');

  it('Test gallery url', () => {
    const galleryURL = 'https://hentaifox.com/gallery/59151/';
    expect(parseHFURL(galleryURL)).toBe('59151');
  });
  it('Test page url', () => {
    const pageURL = 'https://hentaifox.com/g/59151/14/';
    expect(parseHFURL(pageURL)).toBe('59151');
  });
  it('Test invalid url', () => {
    const invalidURL = 'https://hentaifffffffox.com/gallery/59151/';
    expect(() => parseHFURL(invalidURL)).toThrow();
  });

  it('Test non string url', () => {
    const nonString = 123;
    expect(() => parseHFURL(nonString)).toThrow();
  });
});

describe('#parseArgs', () => {
  const { parseArgs } = require('./lib');

  it('Test URL', () => {
    const validArgs = ['https://hentaifox.com/gallery/59153/'];
    expect(parseArgs(validArgs)).toEqual({
      mangaId: '59153'
    });
  });
  it('Test MangaID', () => {
    const validArgs = ['59153'];
    expect(parseArgs(validArgs)).toEqual({
      mangaId: '59153'
    });
  });
  it('Test Invalid', () => {
    const invalidArgs = [];
    expect(() => parseArgs(invalidArgs)).toThrow();
  });
  it('Test Undefined', () => {
    const invalidArgs = [];
    expect(() => parseArgs(invalidArgs)).toThrow();
  });
});

describe('#getGalleryPageURL', () => {
  const { getGalleryPageURL } = require('./lib');

  it('Correct URL', () => {
    expect(getGalleryPageURL('123445')).toBe(
      'https://hentaifox.com/gallery/123445/'
    );
  });
});

describe('#getGalleryPage', () => {
  const { getGalleryPage } = require('./lib');

  it('Test implementation', async () => {
    let call1 = false,
      call2 = false,
      call3 = false;

    const fetch = async url => {
      expect(url).toBe('https://hentaifox.com/gallery/123445/');
      call1 = true;

      return {
        text: async () => {
          call2 = true;
          return 'some html';
        }
      };
    };
    function JSDOM(html) {
      expect(html).toBe('some html');
      call3 = true;
    }

    await getGalleryPage('123445', fetch, JSDOM);

    expect(call1 && call2 && call3).toBeTruthy();
  });
});

describe('#parseCharacters', () => {
  const { parseCharacters } = require('./lib');

  it('Test valid', () => {
    const text = 'Characters: CharA A, CharB';
    expect(parseCharacters(text)).toEqual(['CharA A', 'CharB']);
  });

  it('Test null', () => {
    expect(parseCharacters(undefined)).toBeUndefined();
  });
});

describe('#parseTags', () => {
  const { parseTags } = require('./lib');

  it('Test valid', () => {
    const text = 'Tags: A, B, C';
    expect(parseTags(text)).toEqual(['A', 'B', 'C']);
  });

  it('Test null', () => {
    expect(parseTags(undefined)).toBeUndefined();
  });
});

describe('#parseArtists', () => {
  const { parseArtists } = require('./lib');

  it('Test valid', () => {
    const text = 'Artists: A, B, C';
    expect(parseArtists(text)).toEqual(['A', 'B', 'C']);
  });

  it('Test null', () => {
    expect(parseArtists(undefined)).toBeUndefined();
  });
});

describe('#parsePageCount', () => {
  const { parsePageCount } = require('./lib');

  it('Test valid', () => {
    const text = 'Pages: 12';
    expect(parsePageCount(text)).toBe(12);
  });

  it('Test non int', () => {
    const text = 'Pages: avd';
    expect(parsePageCount(text)).toBeUndefined();
  });

  it('Test null', () => {
    expect(parsePageCount(undefined)).toBeUndefined();
  });
});

describe('#parseImageURLBase', () => {
  const { parseImageURLBase } = require('./lib');

  it('Test valid', () => {
    const text = '//i.hentaifox.com/002/1415561/cover.jpg';
    expect(parseImageURLBase(text)).toBe('i.hentaifox.com/002/1415561');
  });

  it('Test invalid', () => {
    const text = 'Invalid';
    expect(parseImageURLBase(text)).toBeUndefined();
  });

  it('Test null', () => {
    expect(parseImageURLBase(undefined)).toBeUndefined();
  });
});

describe('#getGalleryPageInfo', () => {
  const {
    getGalleryPageInfo,
    SELECTOR_MANGA_TITLE,
    SELECTOR_MANGA_ARTISTS,
    SELECTOR_MANGA_CHARACTERS,
    SELECTOR_MANGA_IMAGE_URL_BASE,
    SELECTOR_MANGA_PAGE_COUNT,
    SELECTOR_MANGA_TAGS
  } = require('./lib');
  it('Test validity', () => {
    const selMap = {};
    selMap[SELECTOR_MANGA_TITLE] = 'title';
    selMap[SELECTOR_MANGA_ARTISTS] = 'Artists: ArtistA';
    selMap[SELECTOR_MANGA_CHARACTERS] = 'Characters: CharacterA';
    selMap[SELECTOR_MANGA_PAGE_COUNT] = 'Pages: 12';
    selMap[SELECTOR_MANGA_TAGS] = 'Tags: TagA';

    const page = {
      window: {
        document: {
          querySelector: selector => {
            if (selector === SELECTOR_MANGA_IMAGE_URL_BASE)
              return { src: '//i.hentaifox.com/002/1415561/cover.jpg' };
            return {
              textContent: selMap[selector]
            };
          }
        }
      }
    };

    expect(getGalleryPageInfo(page, '1234')).toEqual({
      mangaId: '1234',
      title: 'title',
      characters: ['CharacterA'],
      tags: ['TagA'],
      artists: ['ArtistA'],
      pageCount: 12,
      imageBaseURL: 'i.hentaifox.com/002/1415561'
    });
  });

  it('Test invalid invalid page count', () => {
    const selMap = {};
    selMap[SELECTOR_MANGA_PAGE_COUNT] = 'Invalid';

    const page = {
      window: {
        document: {
          querySelector: selector => {
            return {
              textContent: selMap[selector]
            };
          }
        }
      }
    };

    expect(() => getGalleryPageInfo(page, '1234')).toThrow();
  });

  it("Test null elements", ()=>{
    const selMap = {};
    selMap[SELECTOR_MANGA_PAGE_COUNT] = 'Pages: 12';

    const page = {
      window: {
        document: {
          querySelector: selector => {
            return {
              textContent: selMap[selector]
            };
          }
        }
      }
    };

    expect(getGalleryPageInfo(page, undefined)).toEqual({
      mangaId: undefined,
      title: undefined,
      characters: [],
      tags: [],
      artists: [],
      pageCount: 12,
      imageBaseURL: undefined
    });
  })
});

describe('#downloadPages', () => {
  const { downloadPages } = require('./lib');
  it('Test working', async () => {
    const info = {
      pageCount: 1,
      imageBaseURL: 'i.hentaifox.com/002/1415638'
    };
    const dir = './testPath';

    const fs = {
      existsSync: filePath => {
        expect(filePath).toBe('testPath/1.jpg');
        return false;
      }
    };
    const download = async (url, filePath) => {
      expect(url).toBe('https://i.hentaifox.com/002/1415638/1.jpg');
      expect(filePath).toBe('testPath/1.jpg');
    };

    await downloadPages(info, dir, download, fs);
  });

  it('Test skip download if file exists', async () => {
    const info = {
      pageCount: 10,
      imageBaseURL: 'i.hentaifox.com/002/1415638'
    };
    const dir = './testPath';

    const fs = {
      existsSync: filePath => {
        return filePath == 'testPath/01.jpg';
      }
    };

    let count = 0;
    const download = async (url, filePath) => {
      count++;
    };

    await downloadPages(info, dir, download, fs);

    expect(count).toBe(9);
  });
});
