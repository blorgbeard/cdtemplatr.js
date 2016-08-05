'use strict';

var log = requireShared('Log')("backendServer");
var config = requireShared('config');

var express = require('express');
var path = require('path');

var app = express();

var Promise = require('bluebird');

Promise.all([    
  requireShared('Domain')(config),
  requireShared('Tfs')(config)  
]).then(results => {

  var controller = require('./build/Controller')(results[0], results[1]);
  var router = require('./build/Router')(controller);
  app.use('/build', router);

  var port = config.backendServer.port || 7778;

  app.listen(port, function () {
    log.info(`Started listening on port ${port}.`);
  });
});
