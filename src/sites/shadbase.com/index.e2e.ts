import down from './index';
import * as info from './info';

down.getFromURL('http://www.shadbase.com/new-sonic-edits/')
    .then((data) => console.log(data))
    .catch((e) => console.error(e));

console.log(info.getIdFromURL('http://www.shadbase.com/new-sonic-edits/'));
