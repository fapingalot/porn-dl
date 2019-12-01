(() => {
    const apiURL = document.getElementById('apiURL') as HTMLInputElement;
    const apiKey = document.getElementById('apiKey') as HTMLInputElement;
    const apiSecret = document.getElementById('apiSecret') as HTMLInputElement;
    const open = document.getElementById('open') as HTMLInputElement;
    const active = document.getElementById('active') as HTMLInputElement;

    // Live updates
    browser.storage.onChanged.addListener((data, type) => {
        if (type !== 'local') { return; }

        if (data.apiURL) { apiURL.value = data.apiURL.newValue; }
        if (data.apiKey) { apiKey.value = data.apiKey.newValue; }
        if (data.apiSecret) { apiSecret.value = data.apiSecret.newValue; }

        if (data.open) { open.checked = data.open.newValue; }
        if (data.active) { active.checked = data.active.newValue; }
    });

    // Reset
    (document.getElementById('resetButton') as HTMLElement).onclick = () => {
        browser.storage.local.set({
            apiURL: 'http://localhost:8080/',
            apiKey: '',
            apiSecret: '',

            open: true,
            active: false,
        });
    };

    (document.getElementById('body') as HTMLElement).onload = () => {
        browser.storage.local.get(['apiURL', 'apiKey', 'apiSecret', 'open', 'current', 'active'])
            .then((data) => {
                // The defaults
                apiURL.value = data.apiURL || 'http://localhost:8080/';
                apiKey.value = data.apiKey || '';
                apiSecret.value = data.apiSecret || '';

                open.checked = data.open;
                active.checked = data.active;
            });
    };

    (document.getElementById('saveButton') as HTMLElement).onclick = () => {
        browser.storage.local.set({
            apiURL: apiURL.value,
            apiKey: apiKey.value,
            apiSecret: apiSecret.value,

            open: open.checked,
            active: active.checked,
        });
    };
})();
