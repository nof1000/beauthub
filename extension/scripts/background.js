(function(window, storage, runtime, browser, tabs) {
    'use strict';

    /**
     * Constants
     * @private
     */
    var RE_URL_GITHUB = /.*\:\/\/(.*\.)?github\.com.*/;
    var GITHUB_URLS = ['*://github.com/*', '*://*.github.com/*'];

    /**
     * Methods
     * @private
     */
    function getFileWithThemes(callback) {
        runtime.getPackageDirectoryEntry(function(root) {
            root.getFile('themes.json', {}, function(entry) {
                entry.file(function(file) {
                    var reader = new FileReader();

                    reader.onloadend = function(data) {
                        callback(JSON.parse(this.result));
                    };

                    reader.readAsText(file);
                });
            });
        });
    }

    function getCurrentTheme(callback) {
        storage.sync.get(null, function(data) {
            var theme = data.theme;

            if (!theme) theme = 0;
            if (callback) callback(theme);
        });
    }

    function setCurrentTheme(id, callback) {
        storage.sync.set({ theme: id }, function() {
            if (callback) callback(true);
        });
    }

    function isGithub(tab) {
        return RE_URL_GITHUB.test(tab.url);
    }

    /**
     * Implementation
     * @private
     */
    getCurrentTheme(function(theme) {
        getFileWithThemes(function(themes) {
            runtime.onMessage.addListener(function(message, _, response) {
                if (!message && !message.type) return;

                /** Popup is open */
                if (message.type == 'init_popup') {
                    return response({
                        chosen: theme,
                        list: themes,
                    });
                }

                /** Theme is chosen */
                if (message.type == 'update_theme') {
                    return setCurrentTheme(message.theme, function() {
                        theme = message.theme;

                        /** Reload all tabs with github */
                        tabs.query({ url: GITHUB_URLS }, function(actives) {
                            actives.forEach(function(tab) {
                                tabs.reload(tab.id);
                            });

                            response(true);
                        });
                    });
                }
            });

            tabs.onUpdated.addListener(function(id, info, tab) {
                if (!info.status) return;

                if (info.status === 'loading') {
                    if (isGithub(tab)) browser.enable(id);
                    else browser.disable(id);

                    if (!themes[theme].style) return;
                    tabs.insertCSS(id, {
                        runAt: 'document_start',
                        file: 'styles/themes/' + themes[theme].style,
                    });
                }
            });
        });
    });
})(
    this,
    this.chrome.storage,
    this.chrome.runtime,
    this.chrome.browserAction,
    this.chrome.tabs
);
