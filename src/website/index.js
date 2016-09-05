'use strict';

var log = requireShared('Log')("website");

var express = require('express');
var path = require('path');
var ntlm = require('express-ntlm');

var config = requireShared('Config');

var app = express();

// authenticate users with NTLM
app.use('/', ntlm({
  debug: function() {
    log.trace(Array.prototype.slice.apply(arguments).join(' '));
  },
  domain: 'AUCKLAND',
//  domaincontroller: config.ldap && config.ldap.url || undefined
}));

requireShared('Domain')(config).then(db => {

  app.use(function(req, res, next) {
    if (res.locals.ntlm) {
      var username = res.locals.ntlm.UserName;
      var workstation = res.locals.ntlm.Workstation;
      log.trace(`${username}@${workstation} (${req.ip}) sent ${req.method} ${req.originalUrl}`);
      return next();
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

  function renderIndex(req, res) {
    var username = res.locals.ntlm.UserName;      
    db.user.get(username).then(user => {
      res.locals.user = user;
      res.render('index', {
        title: config.website.title || "cdtemplatr.js"
      });      
    });            
  }

  indexRoute.get("/", renderIndex);
  indexRoute.get("/build", renderIndex);
  indexRoute.get("/build/*", renderIndex);

  app.use('/', indexRoute);

  // set up the api that the react components will talk to
  var BuildsController = require('./controllers/BuildController')
  var buildsController = new BuildsController(db);
  var BuildsRouter = require('./routes/BuildsRouter');
  var buildsRouter = new BuildsRouter(buildsController);
  
  app.use('/api/builds', require('body-parser').json(), buildsRouter);

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
