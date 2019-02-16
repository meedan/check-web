const capitalize = (str) => {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const twitterTags = (metadata, config, url) => [
  '<meta content="player" name="twitter:card" />',
  `<meta content="${metadata.title}" name="twitter:title" />`,
  `<meta content="${metadata.description}" name="twitter:text:description" />`,
  `<meta content="${metadata.description}" name="twitter:description" />`,
  `<meta content="${metadata.picture}" name="twitter:image" />`,
  `<meta content="${config.appName}" name="twitter:site" />`,
  `<meta content="${metadata.embed_url}" name="twitter:player" />`,
  `<meta content="${metadata.embed_url}" name="twitter:player:stream" />`,
  '<meta content="800" name="twitter:player:width" />',
  '<meta content="800" name="twitter:player:height" />',
].join('\n');

const facebookTags = (metadata, config, url) => {
  const host = metadata.permalink.replace(/(^https?:\/\/[^\/]+).*/, '$1');
  return [
    '<meta content="article" property="og:type" />',
    `<meta content="${metadata.title}" property="og:title" />`,
    `<meta content="${metadata.picture}" property="og:image" />`,
    `<meta content="${host}${url}" property="og:url" />`,
    `<meta content="${metadata.description}" property="og:description" />`,
  ].join('\n');
};

const metaTags = (metadata, config, url) => {
  const params = url.replace(/^[^?]*/, '');
  return [
    `<meta name="description" content="${metadata.description}" />`,
    `<link rel="alternate" type="application/json+oembed" href="${metadata.oembed_url}${params}" title="${metadata.title}" />`,
  ].join('\n');
};

const socialTags = (metadata, config, url) => {
  if (!metadata) {
    return '';
  }

  return [
    metaTags(metadata, config, url),
    twitterTags(metadata, config, url),
    facebookTags(metadata, config, url),
  ].join('\n');
};

export default ({ config, metadata, url }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${metadata ? metadata.title : capitalize(config.appName)}</title>
        ${socialTags(metadata, config, url)}
        <link href="/images/logo/${config.appName || 'favicon'}.ico" rel="icon">
        <script src="/js/config.js" defer="defer"></script>
        <script src="/js/vendor.bundle.js" defer="defer"></script>
        <script src="https://js.pusher.com/4.4/pusher.min.js"></script>
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Roboto+Mono" rel="stylesheet" type="text/css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.2.0/leaflet.css" />
      </head>
      <body>
        <div id="root"></div>
      </body>
      <script src="/js/index.bundle.js" defer="defer"></script>
    </html>
  `;
