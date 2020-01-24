const getCookies = () => {
    const cookies = {};
    allCookies
        .split(';')
        .map(cookieItem => cookieItem
            .split("="))
        .forEach(item => cookies[item[0]] = cookies[1]);
    return cookies;
}

handleClick = (e) => {

    const chosenValue = e.target.textContent;

    console.log(`Chose: ${chosenValue}.`)

    switch (chosenValue) {
        case ('cookies'):
            console.log('Clicked cookies.')
            const cookies = getCookies();
            console.log(cookies);
            break;
        default:
            break;
    }
};

browser.pageAction.onClicked.addListener(handleClick);

console.log('Exiting observer.')