import down from './index';
import * as info from './info';

down.getFromId('7463-shippai-otori-sousa')
    .then((data) => {
        console.log(data);
    })
    .catch((e) => console.error(e));

console.log(info.getIdFromURL('https://xlecx.com/7463-shippai-otori-sousa.html'));
