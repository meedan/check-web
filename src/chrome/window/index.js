import renderRoot from '../renderRoot';

chrome.runtime.getBackgroundPage( background => {
  var url = document.location.search.replace(/^\?url=/, '');
  renderRoot(chrome, background, url);
});
