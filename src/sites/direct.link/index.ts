import { parse as parseURL } from 'url';
import { IContentGetter } from '..';
import { fetchByURL, OContent, SRC, EXTENSION_REGEX } from './info';

export default {
    src: SRC,

    isValidURL: (url) => {
        const path = parseURL(url, false).pathname as string;
        return EXTENSION_REGEX.test(path.substring(path.lastIndexOf('.') + 1));
    },

    getFromId: (id) => { throw new Error('Unsupported'); },
    getFromURL: (url) => fetchByURL(url),
} as IContentGetter<OContent>;
