import renderRoot from '../../renderRoot';

chrome.runtime.getBackgroundPage( background => {
  chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      var url = tabs[0].url;
      renderRoot(chrome, background, url);
    }
  );
});
