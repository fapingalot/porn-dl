import down from './index';
import * as info from './info';

console.time('Time HTML');
down.getFromId('3225979')
    .then((data) => {
        console.timeEnd('Time HTML');
        // console.log(data);
    })
    .catch((e) => console.error(e));

import fetch from 'node-fetch';
(async () => {
    console.time('Time JSON');
    const data = await (await fetch('https://r34-json-api.herokuapp.com/posts?id=3225979')).json();
    console.timeEnd('Time JSON');
    // console.log(data);
})();

console.log(info.getIdFromURL('https://rule34.xxx/index.php?page=post&s=view&id=3505675'));
