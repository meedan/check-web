// Check app webserver with SSR for the <head> section

"use strict"

import util from 'util';
import fetch from 'node-fetch';
import window from 'node-window';
import express from 'express'
import serveStatic from 'serve-static'

import configFile from '../config';
import template from '../src/web/views/index';

const app = express();
const config = window.config;
const port = process.env.SERVER_PORT || 8000;

// standard headers
app.use(function(req, res, next) {
  // CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // cacheing
  // s-maxage is for cloudflare
  // https://support.cloudflare.com/hc/en-us/articles/202775670-How-Do-I-Tell-CloudFlare-What-to-Cache-
  // cloudflare will cache for 15 minutes
  // browser will cache for 5 minutes
  // so the longest a user can go without getting a fresh item from this webserver is ~20 min (14:59 + 5:00)

  // there is a page rule set at Cloudflare to enforce cacheing index.html which is not a CF default
  // https://support.cloudflare.com/hc/en-us/articles/200172256

  if (process.env.NODE_ENV === 'production') {
    res.header("Cache-Control", "public, s-maxage=900, max-age=300");
  }
  else {
    res.header("Cache-Control", "public, no-cache");
  }

  next();
});

app.get('/js/*.bundle.js', function(req, res, next) {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip');
  next();
});

// static assets first
app.use(serveStatic('build/web', { 'index': ['index.html'] }));

// all other routes
app.use(function(req, res, next) {
 
  // media detail page
  const mediaDetailUrl = req.url.match(/\/([^\/]+)\/project\/([0-9]+)\/media\/([0-9]+)/);
  if (mediaDetailUrl != null) {
    try {
      const query = `query { project_media(ids: "${mediaDetailUrl[3]},${mediaDetailUrl[2]}") { metadata } }`;
      fetch(config.relayPath, { method: 'post', body: `team=${mediaDetailUrl[1]}&query=${query}` }).then(function(response) {
        return response.json();
      }).catch(function(e) {
        res.send(template({ config, metadata: null }));
      }).then(function(json) {
        const metadata = JSON.parse(json.data.project_media.metadata);
        res.send(template({ config, metadata }));
      }).catch(function(e) {
        res.send(template({ config, metadata: null }));
      });
    }
    catch (e) {
      res.send(template({ config, metadata: null }));
    }
  }

  // other pages
  else {
    res.send(template({ config, metadata: null }));
  }
});

console.log('Starting server on port ' + port);
app.listen(port);
