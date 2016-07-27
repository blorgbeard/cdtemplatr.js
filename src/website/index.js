'use strict';

var log = requireShared('Log')("website", "trace");

var express = require('express');
var path = require('path');
var ntlm = require('express-ntlm');

var config = requireShared('config');

var app = express();

// serve static stuff like css, js, images..
app.use(express.static(path.join(__dirname, "/app/dist")));

// serve the main page
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));

app.use(function(req, res, next) {
  log.trace(`${req.ip} sent ${req.method} ${req.originalUrl}`);
  return next();
});

var indexRoute = express.Router();

// "authenticate" users with NTLM (but don't actually check with a domain controller)
indexRoute.use('/', ntlm({
  debug: function() {
    log.trace(Array.prototype.slice.apply(arguments).join(' '));
  },
  // todo: config
  // todo: authenticate properly!
  domain: 'AUCKLAND'
  //domaincontroller: 'ldap:// ???'
}));

indexRoute.get('/', function (req, res) {
  res.render('index', {
    title: config.website.title || "cdtemplatr.js"
  });
});

app.use('/', indexRoute);

// set up the api that the react components will talk to
var apiRouterFactory = require('./routes/api.js');

// choose a domain!
//var domain = require('./domain/testing.js');
//var domain = require('./domain/production.js');

require('./domain/couchdb')(config).then(domain => {
  var apiRouter = apiRouterFactory(domain);
  app.use('/api', apiRouter);

  // start serving!
  var protocol = config.website.protocol;
  var server = null;
  var port = null;
  if (protocol === 'http') {
    server = require('http').createServer(app);
    port = 80;
  } else if (protocol === 'https') {
    var tls = requireShared('config/tls');
    if (!tls.pfx || !tls.pfx.file) {
      throw Error("No certificate configured - unable to serve via https.");
    }
    log.debug(`Using ${tls.pfx.file} as https certificate.`);
    var credentials = {
      pfx: require('fs').readFileSync(path.join(PROJECT_ROOT, tls.pfx.file)),
      passphrase: tls.pfx.passphrase
    };
    server = require('https').createServer(credentials, app);
    port = 443;
  }
  port = config.website.port || port;
  server.listen(port, function () {
      log.info(`Started listening on port ${port}.`);
  });
});
