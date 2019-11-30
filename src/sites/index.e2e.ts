import * as util from './index';

util.fetchContent('https://hentaifox.com/gallery/63795/')
    .then((data) => {
        console.log(data);
    });
util.fetchContent('https://nhentai.net/g/292424/')
    .then((data) => {
        console.log(data);
    });
util.fetchContent('http://www.shadbase.com/new-sonic-edits/')
    .then((data) => {
        console.log(data);
    });
util.fetchContent('https://rule34.xxx/index.php?page=post&s=view&id=3225979')
    .then((data) => {
        console.log(data);
    });
