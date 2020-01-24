const VIEWS = {
    main: "main",
    cookies: 'cookies'
}

const ELEMENT_TYPES = {
    AgentsList: 'agents-list',
    CookiesList: 'cookies-list',
    TrackersList: 'trackers-list'
}

const AGENT_NAMES = {
    Agents: 'agents',
    Cookies: 'cookies',
    Trackers: 'trackers'
}

const AGENTS = [{
        name: AGENT_NAMES.Cookies,
        callback: populateCookies
    },
    {
        name: AGENT_NAMES.Trackers,
        callback: populateTrackers
    }
]

let tabs = null;

function setHeaders() {

    const tab = tabs.pop();

    const headerNode = document.getElementById('header-title');
    const urlString = tab.url;
    const url = new URL(urlString);

    // returns the current viewed page
    //const urlViewArray = urlString.split('/');
    //const currentView = urlViewArray[urlViewArray.length - 1];

    //set the header of the panel
    const text = document.createTextNode(`Agents used by ${url.hostname}`);
    headerNode.appendChild(text);
}

function setSubTitle(listType) {
    const titleNode = document.getElementById('list-title');
    const text = document.createTextNode(`Listing ${listType}`);
    titleNode.appendChild(text);
}

function populateTrackers() {

}

async function populateCookies() {

    //get the first tab object in the array
    let tab = tabs.pop();

    //get all cookies in the domain
    var gettingAllCookies = browser.cookies.getAll({
        url: tab.url
    });

    const cookies = await gettingAllCookies;

    //set the header of the panel
    var activeTabUrl = document.getElementById('header-title');
    var text = document.createTextNode("Cookies at: " + tab.title);
    var cookieList = document.getElementById('cookie-list');
    activeTabUrl.appendChild(text);

    if (cookies.length > 0) {
        //add an <li> item with the name and value of the cookie to the list
        for (let cookie of cookies) {
            let li = document.createElement("li");
            let content = document.createTextNode(cookie.name + ": " + cookie.value);
            li.appendChild(content);
            cookieList.appendChild(li);
        }
    } else {
        let p = document.createElement("p");
        let content = document.createTextNode("No cookies in this tab.");
        let parent = cookieList.parentNode;

        p.appendChild(content);
        parent.appendChild(p);
    }
}

function populateAgents() {

    const agentsList = document.getElementById(ELEMENT_TYPES.AgentsList);

    setSubTitle(AGENT_NAMES.Agents);

    for (const agent of AGENTS) {
        let li = document.createElement("li");
        let content = document.createTextNode(agent.name);
        li.appendChild(content);
        li.onclick = agent.callback;
        agentsList.appendChild(li);
    }
}

//get active tab to run an callback function.
//it sends to our callback an array of tab objects
function getActiveTab() {
    return browser.tabs.query({
        currentWindow: true,
        active: true
    });
}

function showOptions(currentTabs) {
    tabs = currentTabs;
    setHeaders()
    populateAgents()
}

getActiveTab().then(showOptions);