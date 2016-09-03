// production webserver
// August 2016 Benjamin Foote
//
/*  supporting the Docker infrastructure
 *  http://checkdesk-api.qa.checkdesk.org/api/me
 *
 */

var express = require('express'),
    serveStatic = require('serve-static'),
    app = express();

// CORS
app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  next();
	});

// static assets first
app.use(serveStatic('build/web', { 'index': ['index.html'] }))

// all other routes
app.use(function(req, res, next) {
  res.sendFile(process.cwd() + '/build/web/index.html');
});
app.listen(process.env.SERVER_PORT || 8000)
