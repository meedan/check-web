(function() {
  function getQueryParam(name) {
    const urlParams = new URLSearchParams(document.currentScript.src.replace(/^.*\?/, '?'));
    return urlParams.get(name);
  }

  const uptimeId = getQueryParam('uptimeId');
  if (!uptimeId) {
    console.error('Uptime RUM: Missing uptimeId!');
    return;
  }

  console.log(`Running Uptime RUM with ID ${uptimeId}`);

  (function(w, d, s) {
    w._uptime_rum2 = {};
    w._uptime_rum2.errors = [];
    w._uptime_rum2.uuid = uptimeId; // Set dynamically from URL param
    w._uptime_rum2.url = 'https://rumcollector.uptime.com';
    
    s = d.createElement('script');
    s.async = 1;
    s.src = 'https://rum.uptime.com/static/rum/compiled/v2/rum.js';
    d.getElementsByTagName('head')[0].appendChild(s);

    w.addEventListener('error', function(e) {
      w._uptime_rum2.errors.push({ t: new Date(), err: e });
    });
  })(window, document);
})();
