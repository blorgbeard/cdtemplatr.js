'use strict';

var path = require('path');

// the global PROJECT_ROOT variable will point to the root of the git repo
global.PROJECT_ROOT = path.resolve(path.join(__dirname, '..'));

// this function will require a module in src/shared, no matter where it's called from.
global.requireShared = function(name) {
  return require(path.join(__dirname, "shared", name));
}

var config = requireShared('config');

// initialize logging with configured log-level. it will default to the same value
// whenever anything else requires it after this.
var log = requireShared('Log')("launch-website.js", config.loglevel || "debug");

// launch the actual process
var app = "website";
log.info(`Launching ${app}`);
require(path.join(__dirname, app, 'index.js'));
