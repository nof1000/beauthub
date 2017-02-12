(function(window, browser, tabs) {
    browser.onClicked.addListener(function() {
        tabs.create({
            url: 'https://github.com/nof1000/MakeGithubBeautifulAgain',
            active: true,
        });
    });
})(this, this.chrome.browserAction, this.chrome.tabs);
