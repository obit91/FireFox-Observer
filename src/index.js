
const isTrackingDomain = require('is-tracking-domain')
const waitUntil = require('async-wait-until');

const VIEWS = {
    main: "main",
    cookies: 'cookies'
}

const ELEMENT_TYPES = {
    ListTitle: 'list-title',
    ListInstructions: 'list-instructions',
    ListWrapper: 'list-wrapper',
    AgentsList: 'agents-list',
    DataList: 'data-list'
}

const AGENT_NAMES = {
    Agents: 'agents',
    Cookies: 'cookies',
    Trackers: 'trackers',
    Permissions: 'permissions'
}

const AGENTS = [{
        name: AGENT_NAMES.Cookies,
        callback: populateCookies
    },
    {
        name: AGENT_NAMES.Trackers,
        callback: populateTrackers
    },
    {
        name: AGENT_NAMES.Permissions,
        callback: populatePermissions
    }
]

let tab = null;

let currentActiveView = null;

let activeTrackersHtml = null;

function setHeaders() {

    const headerNode = document.getElementById('header-title');
    const urlString = tab.url;
    const url = new URL(urlString);

    // returns the current viewed page
    //const urlViewArray = urlString.split('/');
    //const currentView = urlViewArray[urlViewArray.length - 1];

    //set the header of the panel
    const text = document.createTextNode(`${url.hostname}`);
    headerNode.appendChild(text);
}

async function getHtmlContent(tab) {
    const resolvedHtml = (htmlContent) => {
        activeTrackersHtml = htmlContent;
    }
    await browser.tabs.executeScript(tab.id, {
        "code": "document.documentElement.outerHTML;"
    }, resolvedHtml)

    const htmlContent = await waitUntil(() => {
        return activeTrackersHtml != null
    }, 15000, 250)
    
    return activeTrackersHtml;
}

async function populateTrackers() {

    // isTrackingDomain('doubleclick.net')
    htmlContent = await getHtmlContent(tab);

    tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    // convert the node list into an array.
    const scripts = [...tempDiv.querySelectorAll("script[src]")];

    let resultList = 'No trackers found on this page.'
    if (scripts.length > 0) {
        resultList = scripts.map(source => `<li>${source.src}</li>`)
            .join('')
    }

    const currentView = document.getElementById(ELEMENT_TYPES.DataList);
    currentView.innerHTML = resultList;
}

async function populatePermissions() {

    //get all permissions used by the domain
    const gettingAllPermissions = navigator.permissions.getAll({
        url: tab.url
    });

    const permissions = await gettingAllPermissions;
    const currentView = document.getElementById(ELEMENT_TYPES.DataList);
    let innerData = `<li>No permissions requested by this page.</li>`;
    if (permissions.length > 0) {
        // map-reduce all the permissions into one string of buttons.
        innerData = permissions.map(permission => `<li id="${permission.name}" 
                                            class="nav-item dropdown">
                                                <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                                                ${permission.name}
                                                </a>
                                                <div class="dropdown-menu">
                                                    <div class="dropdown-item">${permission.value}</a>
                                                </div>
                                            </li>`)
            .join('');
    };
    currentView.innerHTML = innerData;
}

async function populateCookies() {

    //get all cookies in the domain
    const gettingAllCookies = browser.cookies.getAll({
        url: tab.url
    });

    const cookies = await gettingAllCookies;
    const currentView = document.getElementById(ELEMENT_TYPES.DataList);
    let innerData = `<li>No cookies in this tab.</li>`;
    if (cookies.length > 0) {
        // map-reduce all the cookies into one string of buttons.
        innerData = cookies.map(cookie => `<li id="${cookie.name}" 
                                            class="nav-item dropdown">
                                                <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                                                ${cookie.name}
                                                </a>
                                                <div class="dropdown-menu">
                                                    <div class="dropdown-item">${cookie.value}</a>
                                                </div>
                                            </li>`)
            .join('');
    };
    currentView.innerHTML = innerData;
}

function activateAgentView(agent) {

    // show the agents tab.
    const listWrapperNode = document.getElementById(ELEMENT_TYPES.ListWrapper);
    listWrapperNode.hidden = false;

    // drop current agent.
    const currentAgentList = document.getElementById(ELEMENT_TYPES.DataList);
    currentAgentList.innerHTML = '';

    agent.callback();
}

function populateAgents() {

    // hiden current agent view.
    const listWrapper = document.getElementById(ELEMENT_TYPES.ListWrapper);
    listWrapper.hidden = true;

    const agentsList = document.getElementById(ELEMENT_TYPES.AgentsList);

    const agentsInstructions = document.getElementById(ELEMENT_TYPES.ListInstructions)

    for (const agent of AGENTS) {
        // creates a list item.
        let li = document.createElement("li");
        li.classList.add('nav-item');
        li.onclick = activateAgentView.bind(null, agent);
        li.id = `agent-${agent.name}`;

        let a = document.createElement("a");
        a.classList.add('nav-link')
        a.setAttribute('href', '#');
        a.innerHTML = agent.name;
        a.onclick = (e) => {
            agentsInstructions.hidden = true;
            currentActiveView.active = false;
            a.active = true;
            currentActiveView = a;
        }

        li.appendChild(a);

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
    tab = tabs.pop();
    setHeaders()
    populateAgents()
}

getActiveTab().then(showOptions);