import down from './index';

down.getFromId('63791')
    .then((data) => console.log(data))
    .catch((e) => console.error(e));
