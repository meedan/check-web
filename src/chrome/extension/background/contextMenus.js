let windows = {app: 0, devtools: 0};

const MENU_APP = 'MENU_APP';

function addToMenu(id, title, contexts, onClick) {
  chrome.contextMenus.create({
    id: id,
    title: title,
    contexts: contexts,
    onclick: function(info, tab) {
      onClick(info, tab);
    }
  });
}

function closeIfExist(type) {
  if (windows[type] > 0) {
    chrome.windows.remove(windows[type]);
    windows[type] = chrome.windows.WINDOW_ID_NONE;
  }
}

function popWindow(info, tab) {
  var action = 'open',
      url = 'window.html',
      type = 'app';

  closeIfExist(type);
  
  let options = {
    type: 'popup',
    left: 100,
    top: 100,
    width: 630,
    height: 530
  };
  
  if (action === 'open') {
    options.url = chrome.extension.getURL(url) + '?url=' + info.linkUrl;
    chrome.windows.create(options, (win) => {
      windows[type] = win.id;
    });
  }
}

function createMenu() {
  addToMenu(MENU_APP, 'Checkdesk', ['all'], popWindow);
}

export default createMenu;
