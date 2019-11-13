console.log = jest.fn();

describe("#parseHFURL", () => {
  const { parseHFURL } = require("./lib");

  it("Test gallery url", () => {
    const galleryURL = "https://hentaifox.com/gallery/59151/";
    expect(parseHFURL(galleryURL)).toBe("59151");
  });
  it("Test page url", () => {
    const pageURL = "https://hentaifox.com/g/59151/14/";
    expect(parseHFURL(pageURL)).toBe("59151");
  });
  it("Test invalid url", () => {
    const invalidURL = "https://hentaifffffffox.com/gallery/59151/";
    expect(() => parseHFURL(invalidURL)).toThrow();
  });

  it("Test non string url", () => {
    const nonString = 123;
    expect(() => parseHFURL(nonString)).toThrow();
  });
});

describe("#parseArgs", () => {
  const { parseArgs } = require("./lib");

  it("Test URL", () => {
    const validArgs = ["https://hentaifox.com/gallery/59153/"];
    expect(parseArgs(validArgs)).toEqual({
      mangaId: "59153"
    });
  });
  it("Test MangaID", () => {
    const validArgs = ["59153"];
    expect(parseArgs(validArgs)).toEqual({
      mangaId: "59153"
    });
  });
  it("Test Invalid", () => {
    const invalidArgs = [];
    expect(() => parseArgs(invalidArgs)).toThrow();
  });
  it("Test Undefined", () => {
    const invalidArgs = [];
    expect(() => parseArgs(invalidArgs)).toThrow();
  });
});

describe("#getGalleryPageURL", () => {
  const { getGalleryPageURL } = require("./lib");

  it("Correct URL", () => {
    expect(getGalleryPageURL("123445")).toBe(
      "https://hentaifox.com/gallery/123445/"
    );
  });
});

describe("#getGalleryPage", () => {
  const { getGalleryPage } = require("./lib");

  it("Test implementation", async () => {
    let call1 = false,
      call2 = false,
      call3 = false;

    const fetch = async url => {
      expect(url).toBe("https://hentaifox.com/gallery/123445/");
      call1 = true;

      return {
        text: async () => {
          call2 = true;
          return "some html";
        }
      };
    };
    function JSDOM(html) {
      expect(html).toBe("some html");
      call3 = true;
    }

    await getGalleryPage("123445", fetch, JSDOM);

    expect(call1 && call2 && call3).toBeTruthy();
  });
});

describe("#parseTagContainer", () => {
  const { parseTagContainer } = require("./lib");

  it("Test valid", () => {
    const selector = selector => "SOME SELECTOR";
    const $$ = cssSelector => {
      expect(cssSelector).toBe(selector);
      return [
        { textContent: "A" },
        { textContent: "B" },
        { textContent: "C" }
      ].map(v => ({ ...v, removeChild: () => {} }));
    };

    expect(parseTagContainer($$, selector)).toStrictEqual(["A", "B", "C"]);
  });

  it("Test null", () => {
    const $$ = _ => [];
    const selector = "";

    expect(parseTagContainer($$, selector)).toStrictEqual([]);
  });
});

describe("#parsePageCount", () => {
  const { parsePageCount } = require("./lib");

  it("Test valid", () => {
    const text = "Pages: 12";
    expect(parsePageCount(text)).toBe(12);
  });

  it("Test non int", () => {
    const text = "Pages: avd";
    expect(parsePageCount(text)).toBeUndefined();
  });

  it("Test null", () => {
    expect(parsePageCount(undefined)).toBeUndefined();
  });
});

describe("#parseImageURLBase", () => {
  const { parseImageURLBase } = require("./lib");

  it("Test valid", () => {
    const text = "https://i.hentaifox.com/002/1415561/cover.jpg";
    expect(parseImageURLBase(text)).toBe("i.hentaifox.com/002/1415561");
  });

  it("Test invalid", () => {
    const text = "Invalid";
    expect(parseImageURLBase(text)).toBeUndefined();
  });

  it("Test null", () => {
    expect(parseImageURLBase(undefined)).toBeUndefined();
  });
});

describe("#getGalleryPageInfo", () => {
  const {
    getGalleryPageInfo,

    SELECTOR_MANGA_TITLE,
    SELECTOR_MANGA_IMAGE_URL_BASE,
    SELECTOR_MANGA_PAGE_COUNT,

    SELECTOR_MANGA_PARODIES,
    SELECTOR_MANGA_CHARACTERS,
    SELECTOR_MANGA_TAGS,
    SELECTOR_MANGA_ARTISTS,
    SELECTOR_MANGA_GROUPS,
    SELECTOR_MANGA_LANGUAGES,
    SELECTOR_MANGA_CATEGORIES
  } = require("./lib");
  it("Test validity", () => {
    const selMap = {};
    selMap[SELECTOR_MANGA_TITLE] = {
      textContent: "Shall I make Remnyan to Nyannyan Suru?"
    };
    selMap[SELECTOR_MANGA_IMAGE_URL_BASE] = {
      src: "https://i.hentaifox.com/002/1504804/cover.jpg"
    };
    selMap[SELECTOR_MANGA_PAGE_COUNT] = { textContent: "Pages: 23" };

    const selMapAll = {};
    selMapAll[SELECTOR_MANGA_PARODIES] = [
      { textContent: "ParodyA", removeChild: () => {} }
    ];
    selMapAll[SELECTOR_MANGA_CHARACTERS] = [
      { textContent: "CharacterA", removeChild: () => {} }
    ];
    selMapAll[SELECTOR_MANGA_TAGS] = [
      { textContent: "TagA", removeChild: () => {} }
    ];
    selMapAll[SELECTOR_MANGA_ARTISTS] = [
      { textContent: "ArtistA", removeChild: () => {} }
    ];
    selMapAll[SELECTOR_MANGA_GROUPS] = [
      { textContent: "GroupA", removeChild: () => {} }
    ];
    selMapAll[SELECTOR_MANGA_LANGUAGES] = [
      { textContent: "LanguageA", removeChild: () => {} }
    ];
    selMapAll[SELECTOR_MANGA_CATEGORIES] = [
      { textContent: "CategoryA", removeChild: () => {} }
    ];

    const page = {
      window: {
        document: {
          querySelector: selector => selMap[selector],
          querySelectorAll: selector => selMapAll[selector]
        }
      }
    };

    expect(getGalleryPageInfo(page, "62841")).toEqual({
      mangaId: "62841",
      title: "Shall I make Remnyan to Nyannyan Suru?",
      parodies: ["ParodyA"],
      characters: ["CharacterA"],
      tags: ["TagA"],
      artists: ["ArtistA"],
      groups: ["GroupA"],
      languages: ["LanguageA"],
      categories: ["CategoryA"],
      pageCount: 23,

      imageBaseURL: "i.hentaifox.com/002/1504804"
    });
  });

  it("Test invalid invalid page count", () => {
    const selMap = {};
    selMap[SELECTOR_MANGA_PAGE_COUNT] = "Invalid";

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

    expect(() => getGalleryPageInfo(page, "1234")).toThrow();
  });

  it("Test null elements", () => {
    const selMap = {};
    selMap[SELECTOR_MANGA_PAGE_COUNT] = "Pages: 12";

    const page = {
      window: {
        document: {
          querySelector: selector => ({ textContent: selMap[selector] }),
          querySelectorAll: selector => ([])
        }
      }
    };

    expect(getGalleryPageInfo(page, undefined)).toEqual({
      mangaId: undefined,
      title: undefined,
      parodies: [],
      characters: [],
      tags: [],
      artists: [],
      groups: [],
      languages: [],
      categories: [],
      pageCount: 12,

      imageBaseURL: undefined
    });
  });
});

describe("#downloadPages", () => {
  const { downloadPages } = require("./lib");
  it("Test working", async () => {
    const info = {
      pageCount: 1,
      imageBaseURL: "i.hentaifox.com/002/1415638"
    };
    const dir = "./testPath";

    const fs = {
      existsSync: filePath => {
        expect(filePath).toBe("testPath/1.jpg");
        return false;
      }
    };
    const download = async (url, filePath) => {
      expect(url).toBe("https://i.hentaifox.com/002/1415638/1.jpg");
      expect(filePath).toBe("testPath/1.jpg");
    };

    await downloadPages(info, dir, download, fs);
  });

  it("Test skip download if file exists", async () => {
    const info = {
      pageCount: 10,
      imageBaseURL: "i.hentaifox.com/002/1415638"
    };
    const dir = "./testPath";

    const fs = {
      existsSync: filePath => {
        return filePath == "testPath/01.jpg";
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
