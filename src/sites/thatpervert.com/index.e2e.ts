import down from './index';
import * as info from './info';

down.getFromId('4141717')
    .then((data) => {
        console.log(data);
    })
    .catch((e) => console.error(e));

down.getFromId('4110633')
    .then((data) => {
        console.log(data);
    })
    .catch((e) => console.error(e));

down.getFromId('3835556')
    .then((data) => {
        console.log(data);
    })
    .catch((e) => console.error(e));

console.log(info.getIdFromURL('http://thatpervert.com/post/4164184'));
