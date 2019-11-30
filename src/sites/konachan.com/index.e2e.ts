import down from './index';
import * as info from './info';

down.getFromURL('https://konachan.com/post/show/295159/camera-clouds-darling_in_the_franxx-dress-headdres')
    .then((data) => {
        console.log(data);
    })
    .catch((e) => console.error(e));
console.log(
    info.getIdFromURL('https://konachan.com/post/show/295159/camera-clouds-darling_in_the_franxx-dress-headdres'),
);
