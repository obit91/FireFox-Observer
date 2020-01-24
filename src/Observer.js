const VIEWS = {
    main: "main",
    cookies: 'cookies'
}

const ELEMENT_TYPES = {
    ListTitle: 'list-title',
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

function populateTrackers() {
    const currentView = document.getElementById(ELEMENT_TYPES.DataList);
    currentView.innerHTML = `<p>howdy there trackers</p>`
}

function populatePermissions() {
    const currentView = document.getElementById(ELEMENT_TYPES.DataList);
    currentView.innerHTML = `<p>howdy there permissions</p>`
}

async function populateCookies() {

    //get all cookies in the domain
    const gettingAllCookies = browser.cookies.getAll({
        url: tab.url
    });

    const cookies = await gettingAllCookies;
    console.log(cookies)
    const dataList = document.getElementById(ELEMENT_TYPES.dataList);
    console.log(dataList)
    let innerData = `<p>No cookies in this tab.</p>`;

    if (cookies.length > 0) {
        innerData = cookies.map(cookie => {
                `<li id=${cookie.name}>${cookie.name}</li>`
            })
            .join('');
        dataList.innerHTML = innerData;
    };
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

    for (const agent of AGENTS) {
        let li = document.createElement("li");
        let content = document.createTextNode(agent.name);
        li.appendChild(content);
        li.onclick = activateAgentView.bind(null, agent);
        li.id = `agent-${agent.name}`;
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