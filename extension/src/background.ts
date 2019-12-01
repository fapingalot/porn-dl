interface IConfig {
  apiURL?: string;
  apiKey?: string;
  apiSecret?: string;

  open?: boolean;
  active?: boolean;
}



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

  const getConfig = () => browser.storage.local.get(['apiURL', 'apiKey', 'apiSecret', 'open', 'active']) as Promise<IConfig>;
  const callAPI = (apiURL: string | undefined, data: any) => loadJSON<{ success: boolean, name: string }[]>(apiURL || 'http://localhost:8080', data);

  browser.browserAction.onClicked.addListener(async () => {
    const config = await getConfig();
    console.log(config);

    const tabsData = await browser.tabs.query({});
    // console.log(tabsData);

    const tabs = tabsData
      .filter(tab => tab.url && tab.url.startsWith('http'))
      .filter(tab => config.active ? tab.active : true)
      .map((tab) => ({ url: tab.url, open: config.open }));
    console.log(tabs);

    tabs.forEach(async (tab) => {
      const data = await callAPI(config.apiKey, [tab]);
      data.forEach(({ success, name }) => {
        if (success) {
          // Success
          browser.notifications.create({
            type: 'basic',
            iconUrl: 'icons/incon-48.png',
            title: 'Downloaded',
            message: name
          });
        } else {
          // Failure
          browser.notifications.create({
            type: 'basic',
            iconUrl: 'icons/incon-48.png',
            title: 'Failed to download',
            message: name
          });
        }
      });
    });
  });
})();
