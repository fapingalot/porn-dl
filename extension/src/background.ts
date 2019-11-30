(() => {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if ((window as any).hasRun) {
    return;
  }
  (window as any).hasRun = true;

  const loadJSON = <T = any>(url: string, data: any) =>
    new Promise<T>((res, rej) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            return res(JSON.parse(xhr.responseText));
          }
          return rej(xhr);
        }
      };
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    });

  browser.browserAction.onClicked.addListener(() => {
    browser.tabs
      .query({})
      .then(tabs =>
        tabs
          .filter(tab => tab.url && tab.url.startsWith('http'))
          .filter(tab => tab.active)
          .map(tab => ({ url: tab.url, open: true }))
      )
      .then(tabsData =>
        tabsData.map(tab =>
          loadJSON<{ success: boolean, name: string }[]>('http://localhost:8080', [tab]).then(data =>
            data.forEach(({ success, name }) => {
              if (success) {
                browser.notifications.create({
                  type: 'basic',
                  iconUrl: 'icons/incon-48.png',
                  title: 'Downloaded',
                  message: name
                });
              } else {
                browser.notifications.create({
                  type: 'basic',
                  iconUrl: 'icons/incon-48.png',
                  title: 'Failed to download',
                  message: name
                });
              }
            })
          )
        )
      );
  });
})();
