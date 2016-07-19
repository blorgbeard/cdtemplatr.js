'use strict';

global.requireShared = function(name) {
  return require(require('path').join(__dirname, "../shared", name));
}

var log = requireShared('Log')("server", "trace");

var express = require('express');
var path = require('path');
var ntlm = require('express-ntlm');

//require('./populateTestData.js');

//app.use(bodyParser.urlencoded({ extended: false }));

var app = express();

// serve static stuff like css, js, images..
app.use(express.static(path.join(__dirname, "/app/dist")));

// serve the main page
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));

var indexRoute = express.Router();

// "authenticate" users with NTLM (but don't actually check with a domain controller)
indexRoute.use('/', ntlm({
  debug: function() {
    var args = Array.prototype.slice.apply(arguments);
    console.log.apply(null, args);
  },
  domain: 'AUCKLAND'
  //domaincontroller: 'ldap:// ???'
}));


indexRoute.get('/', function (req, res) {
  res.render('index', {
    title: "cdtemplatr.js"
  });
});

app.use('/', indexRoute);

// set up the api that the react components will talk to
var apiRouterFactory = require('./routes/api.js');

// choose a domain!
//var domain = require('./domain/testing.js');
//var domain = require('./domain/production.js');

var config = requireShared('Config')();
require('./domain/couchdb')(config).then(domain => {
  var apiRouter = apiRouterFactory(domain);
  app.use('/api', apiRouter);

  // start serving!
  app.listen(7777, function () {
      console.log("Started listening on port", 7777);
  });
});
