
browser.browserAction.onClicked.addListener((tab) => {
    const cookies = getCookies();
    console.log(cookies);
});

getCookies = () => {
    const cookies = {}
    allCookies
        .split(';')
        .map(cookieItem => cookieItem
            .split("="))
        .forEach(item => cookies[item[0]] = cookies[1])
    return cookies;
}