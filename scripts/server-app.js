// Check app webserver with SSR for the <head> section

const util = require('util');
const fetch = require('node-fetch');
const express = require('express');
const serveStatic = require('serve-static');

const configs = require('../config-server');
const template = require('../src/web/views/index');

const app = express();
const mode = process.env.MODE || 'default';
const config = configs[mode] || configs.default;

// standard headers
app.use((req, res, next) => {
  // CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // cacheing
  // s-maxage is for cloudflare
  // https://support.cloudflare.com/hc/en-us/articles/202775670-How-Do-I-Tell-CloudFlare-What-to-Cache-
  // cloudflare will cache for 15 minutes
  // browser will cache for 5 minutes
  // so the longest a user can go without getting a fresh item from this webserver is ~20 min (14:59 + 5:00)

  // there is a page rule set at Cloudflare to enforce cacheing index.html which is not a CF default
  // https://support.cloudflare.com/hc/en-us/articles/200172256

  if (process.env.NODE_ENV === 'production') {
    res.header('Cache-Control', 'public, s-maxage=900, max-age=300');
  } else {
    res.header('Cache-Control', 'public, no-cache');
  }

  next();
});

app.get('/js/*.bundle*.js', (req, res, next) => {
  req.url = `${req.url}.gz`;
  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'text/javascript');
  next();
});

app.get('/*.chunk*.js', (req, res, next) => {
  const filename = req.url.replace(/^.*\//, '');
  req.url = `/js/${filename}.gz`;
  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'text/javascript');
  next();
});

// static assets first
app.use(serveStatic('build/web', { index: ['index.html'] }));


const headers = {
  'Content-Type': 'application/json',
  'X-Check-Token': config.checkApiToken,
};

const relayPath = config.relayPath;

// all other routes
app.use((req, res, next) => {
  res.send(template({ config }));
});

module.exports = app;
