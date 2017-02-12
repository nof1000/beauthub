(function(window, browser, tabs) {
    console.log(browser);
    browser.onClicked.addListener(function() {
        tabs.create({
            url: 'https://github.com/nof1000/MakeGithubBeautifulAgain',
            active: true,
        });
    });
})(this, this.chrome.browserAction, this.chrome.tabs);
