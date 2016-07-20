'use strict';

var path = require('path');

// the global PROJECT_ROOT variable will point to the root of the git repo
global.PROJECT_ROOT = path.resolve(path.join(__dirname, '..'));

// this function will require a module in src/shared, no matter where it's called from.
global.requireShared = function(name) {
  return require(path.join(__dirname, "shared", name));
}

// launch the actual process
// I hope this works with pm2 :\
if (process.argv.length == 3) {
  // first two arguments are "node" and "launch.js"
  require(path.join(__dirname, process.argv[2], 'index.js'));
}
else {
  console.error('Syntax: node launch.js [name of subfolder containing index.js]');
}
