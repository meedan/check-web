const heapAnalytics = config => config.heapAppId ?
  `<script type="text/javascript">
        window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=o(p[c])};
          heap.load("${config.heapAppId}");
    </script>` : '';

const simpleAnalytics = config => config.useAnalytics ?
  `<script async defer data-collect-dnt="true" src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
    <noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" />
    </noscript>` : '';

const uptimeMonitoring = config => config.uptimeId ?
  `<script>(function(w,d,s){w._uptime_rum2={};w._uptime_rum2.errors=[];w._uptime_rum2.uuid='${config.uptimeId}';w._uptime_rum2.url='https://rumcollector.uptime.com';s=document.createElement('script');s.async=1;s.src='https://rum.uptime.com/static/rum/compiled/v2/rum.js';d.getElementsByTagName('head')[0].appendChild(s);w.addEventListener('error',function(e){w._uptime_rum2.errors.push({t:new Date(),err:e})});})(window,document);</script>`
  : '';

module.exports = ({ config }) => {
  const BUNDLE_PREFIX = process.env.BUNDLE_PREFIX ? `.${process.env.BUNDLE_PREFIX}` : '';

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="robots" content="noindex">
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Check</title>
          <meta name="description" content="" />
          <link href="/images/logo/check.ico" rel="icon">
          <script src="/js/config.js" defer="defer"></script>
          <script src="/js/vendor.bundle${BUNDLE_PREFIX}.js" defer="defer"></script>
          <script src="https://js.pusher.com/4.4/pusher.min.js"></script>
          <link rel="preconnect" href="https://rsms.me/">
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.2.0/leaflet.css" />
          ${heapAnalytics(config)}
          <link rel="stylesheet" href="/css/index.bundle${BUNDLE_PREFIX}.css" />
        </head>
        <body>
          <div id="root"></div>
          ${uptimeMonitoring(config)}
          ${simpleAnalytics(config)}
        </body>
        <script src="/js/index.bundle${BUNDLE_PREFIX}.js" defer="defer"></script>
      </html>
  `;
};
