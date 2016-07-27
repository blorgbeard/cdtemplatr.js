'use strict';

var log = requireShared('Log')("backendServer", "trace");
var config = requireShared('config');

var express = require('express');
var path = require('path');

var app = express();

require('./builds/Controller')(config).then(controller => {

  var router = require('./builds/router')(controller);
  app.use('/builds', router);

  var port = config.backendServer.port || 7778;

  app.listen(port, function () {
      log.info(`Started listening on port ${port}.`);
  });
});
