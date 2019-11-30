import * as util from '../sites';
import * as index from './index';

//
// Promisify
//

import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { promisify } from 'util';
const fsWrite = promisify(fs.writeFile);

//
// Helpers
//

const writeInfo = async (data: util.IContent, downloadPath: string, out: string = 'info.json') =>
    await fsWrite(
        path.join(downloadPath, out),
        JSON.stringify(_.omit(data, 'contentURLs'), null, 2), // Remove contentURLs
        { encoding: 'utf8' },
    );

(async () => {
    const content = await util.fetchContent('https://rule34.xxx/index.php?page=post&s=view&id=3225979');
    // console.log(content);

    const downloadPath = path.join(process.cwd(), 'data', content.src, content.id);
    await index.download(content, downloadPath);
    await writeInfo(content, downloadPath);

})().catch((e) => console.error(e));
