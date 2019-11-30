import _ from 'lodash';
import { parse as parseURL } from 'url';

import { ContentType, IPicture, IVideo } from '..';
import { UUID } from '../../utils';

//
// Info
//

export const SRC = 'direct.link';
export type OContent = IPicture | IVideo;

//
// Info
//

export const fetchByURL = async (url: string): Promise<OContent> => ({
    src: SRC + '/' + parseURL(url, false).hostname as string,

    type: ContentType.Picture,
    id: UUID(),
    title: UUID(),

    contentURLs: [[url]],

    extra: {},
});

//
// URL Helper
//

export const EXTENSION_REGEX = /(jpg|jpeg|png|gif|mp4|webm|webp)/i;
