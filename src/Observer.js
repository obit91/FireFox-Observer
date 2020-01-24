const VIEWS = {
    main: "main",
    cookies: 'cookies'
}

const AGENTS = ['Cookies', 'Trackers']

let tabs = null;

function setHeaders(type) {

    let tab = tabs.pop();

    var activeTabUrl = document.getElementById('header-title');

    let title = 'No Title';
    if (type == VIEWS.main) {
        const urlString = tab.url;
        const url = new URL(urlString);
        
        const urlViewArray = urlString.split('/');
        const currentView = urlViewArray[urlViewArray.length - 1];

        const hostname = url.hostname;
        title = `Tracking agents in ${hostname} @ ${currentView}`;
    } else if (type == VIEWS.cookies) {
        title = "Cookies at: " + tab.title;
    }

    //set the header of the panel
    const text = document.createTextNode(title);
    activeTabUrl.appendChild(text);
}

function populateAgents() {

    let tab = tabs.pop();
    const agentsList = document.getElementById('agents-list');

    for (const agent of AGENTS) {
        let li = document.createElement("li");
        let content = document.createTextNode(agent);
        li.appendChild(content);
        agentsList.appendChild(li);
      }
}

function showCookiesForTab(tabs) {
    //get the first tab object in the array
    let tab = tabs.pop();
  
    //get all cookies in the domain
    var gettingAllCookies = browser.cookies.getAll({url: tab.url});
    gettingAllCookies.then((cookies) => {
  
      //set the header of the panel
      var activeTabUrl = document.getElementById('header-title');
      var text = document.createTextNode("Cookies at: "+tab.title);
      var cookieList = document.getElementById('cookie-list');
      activeTabUrl.appendChild(text);
  
      if (cookies.length > 0) {
        //add an <li> item with the name and value of the cookie to the list
        for (let cookie of cookies) {
          let li = document.createElement("li");
          let content = document.createTextNode(cookie.name + ": "+ cookie.value);
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
    });
  }
  
  //get active tab to run an callback function.
  //it sends to our callback an array of tab objects
  function getActiveTab() {
    return browser.tabs.query({currentWindow: true, active: true});
  }

  function showOptions(currentTabs) {
    console.log('in options')
    tabs = currentTabs;
    setHeaders(VIEWS.main)
    populateAgents()
  }

  getActiveTab().then(showOptions);