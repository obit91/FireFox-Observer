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

// based on @Permission.PermissionName
const PERMISSIONS = [
    "geolocation",
    "notifications",
    "push",
    "midi",
    "camera",
    "microphone",
    "speaker",
    "device-info",
    "background-sync",
    "bluetooth",
    "persistent-storage",
    "ambient-light-sensor",
    "accelerometer",
    "gyroscope",
    "magnetometer",
    "clipboard"
];

// based on @Permission.PermissionState
const PERMISSION_STATES = {
    Granted: 'granted',
    Denied: 'denied',
    Prompt: 'prompt',
    Unsupported: 'unsupported',
    NotFound: 'not-found'
}

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

    // can be replaced with promisification
    const htmlContent = await waitUntil(() => {
        return activeTrackersHtml != null
    }, 15000, 250)

    return activeTrackersHtml;
}

function generateLoadingSpinner(type) {
    const spinnerHTML = `<p class="text-center">Analyzing ${type} . . .
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="sr-only">Loading...</span>
                                </div>
                            </div>
                        </p>`
    return spinnerHTML;
}

async function populateTrackers() {

    const currentView = document.getElementById(ELEMENT_TYPES.DataList);
    currentView.innerHTML = generateLoadingSpinner('trackers')

    htmlContent = await getHtmlContent(tab);

    tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    // convert the node list into an array.
    const scripts = [...tempDiv.querySelectorAll("script[src]")];

    const addli = (url, tracker) => {
        return tracker ? `<li class="text-danger">${url}</li>` : `<li class="text-success">${url}</li>`;
    }

    const checkTrackingDomain = (url) => {
        const url1 = url.indexOf(`www.`) == 0 ? url.slice(`www.`.length) : url;
        const url2 = `https://${url}`;
        const url3 = `https://${url1}`;
        return isTrackingDomain(url) || isTrackingDomain(url1) || isTrackingDomain(url2) || isTrackingDomain(url3);
    }

    let blackListed = 'No trackers found on this page.'
    if (scripts.length > 0) {
        blackListed = scripts
            .map(source => (new URL(source.src)).hostname)
            .filter((url, i, arr) => arr.indexOf(url) == i) // remove duplicates
            .map(url => url.indexOf(`www.`) == 0 ? url.slice(`www.`.length) : url)
            .map(url => addli(url, checkTrackingDomain(url)))
            .join('')
    }

    currentView.innerHTML = blackListed;
}

async function populatePermissions() {

    const currentView = document.getElementById(ELEMENT_TYPES.DataList);
    currentView.innerHTML = generateLoadingSpinner('permissions')

    // retrieve all permission states
    let permissionStates = []
    PERMISSIONS.forEach(async permission => {
        window.navigator.permissions
            .query({
                name: permission
            })
            .then(permissionStatus => permissionStates.push([permission, permissionStatus.state]))
            .catch(err => permissionStates.push([permission, PERMISSION_STATES.Unsupported]))
    })

    // can be replaced with async for.
    await waitUntil(() => {
        return permissionStates.length == PERMISSIONS.length
    }, 3000, 50)

    console.table(permissionStates);

    let parsedMicAndCam = 0;

    // let permissionsWithMicAndCam = []
    permissionStates.forEach(([permission, state], i) => {
        if (state != PERMISSION_STATES.Unsupported) {
            permissionStates[i] = [permission, state]
        } else if (permission == 'camera') {
            let constraints = {
                video: true
            };
            window.navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    permissionStates[i] = [permission, PERMISSION_STATES.Granted];
                })
                .catch((err) => {
                    console.log(err.name)
                    if (err.name == "NotAllowedError") {
                        permissionStates[i] = [permission, PERMISSION_STATES.Denied];
                    } if (err.name == "NotFoundError") {
                        permissionStates[i] = [permission, PERMISSION_STATES.NotFound];
                    } else {
                        permissionStates[i] = [permission, state];
                    }
                })
                .finally(() => {
                    parsedMicAndCam += 1;
                });
        } else if (permission == 'microphone') {
            let constraints = {
                audio: true
            };
            window.navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    permissionStates[i] = [permission, PERMISSION_STATES.Granted];
                })
                .catch((err) => {
                    if (err.name == "NotAllowedError") {
                        permissionStates[i] = [permission, PERMISSION_STATES.Denied];
                    } else {
                        permissionStates[i] = [permission, state];
                    }
                })
                .finally(() => {
                    parsedMicAndCam += 1;
                });
        } else {
            permissionStates[i] = [permission, state]
        }
    })

    // can be replaced with async for.
    await waitUntil(() => {
        return parsedMicAndCam == 2
    }, 3000, 50)

    console.table(permissionStates);

    function renderStateDiv(permission, state) {
        let messageColor = '';
        switch (state) {
            case (PERMISSION_STATES.Granted):
                messageColor = 'danger';
                break;
            case (PERMISSION_STATES.Denied):
            case (PERMISSION_STATES.NotFound):
                messageColor = 'success';
                break;
            case (PERMISSION_STATES.Prompt):
                messageColor = 'info';
                break;
            default:
                messageColor = 'secondary';
                break;
        }
        return `<li class="text-${messageColor}">${permission} : ${state}</li>`;
    }

    innerHtmlData = permissionStates
        .map(([permission, state]) => renderStateDiv(permission, state)) // deconstructing permission state list
        .join('');

    currentView.innerHTML = innerHtmlData;
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