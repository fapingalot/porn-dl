import down from './index';

console.log(down.isValidURL('https://rule34.xxx/index.php?page=post&s=list&tags=cameltoe'));
console.log(down.isValidURL('https://img.rule34.xxx//images/2132/963efb9a11342c2891540090f35b038d.jpeg'));

down.getFromURL('https://img.rule34.xxx//images/2132/963efb9a11342c2891540090f35b038d.jpeg')
    .then((data) => console.log(data))
    .catch((e) => console.error(e));
