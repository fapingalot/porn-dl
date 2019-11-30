import down from './index';

down.getFromId('292409')
    .then((data) => console.log(data))
    .catch((e) => console.error(e));
