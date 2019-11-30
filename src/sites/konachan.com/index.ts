import { IContentGetter } from '..';
import { fetchByID, fetchByURL, getIdFromURL, OContent, SRC, URL_REGEX } from './info';

export default {
    src: SRC,

    isValidURL: (url) => URL_REGEX.test(url),

    getFromId: (id) => fetchByID(id),
    getFromURL: (url) => fetchByURL(url, getIdFromURL(url)),
} as IContentGetter<OContent>;
