'use strict';

var log = requireShared('Log')("website", "trace");

var express = require('express');
var path = require('path');
var ntlm = require('express-ntlm');

var config = requireShared('config');

var app = express();

// authenticate users with NTLM
app.use('/', ntlm({
  debug: function() {
    log.trace(Array.prototype.slice.apply(arguments).join(' '));
  },
  domain: 'AUCKLAND',
//  domaincontroller: config.ldap && config.ldap.url || undefined
}));

requireShared('Database')(config).then(db => {

  app.use(function(req, res, next) {
    if (res.locals.ntlm) {
      var username = res.locals.ntlm.UserName;
      log.trace(`${username} @ ${req.ip} sent ${req.method} ${req.originalUrl}`);
      db.user.get(username).then(user => {
        res.locals.user = user;
        return next();
      });          
    } else {
      throw new Error("Not authorized.");
    }    
  });

  // serve static stuff like css, js, images..
  app.use(express.static(path.join(__dirname, "/app/dist")));

  // serve the main page
  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, '/views'));

  var indexRoute = express.Router();

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

  var domain = require('./domain/couchdb')(db);
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
    var tls = config.secret.tls;
    if (!tls || !tls.pfx || !tls.pfx.file) {
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
  server.listen(process.env.PORT || port, function () {
      log.info(`Started listening on port ${port}.`);
  });
});
