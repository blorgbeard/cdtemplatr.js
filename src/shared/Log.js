'use strict';

var baseLogger = null;
var baseLevel = null;

var pino = require('pino');
var pretty = pino.pretty();
pretty.pipe(process.stdout);  

module.exports = function(name, level) {
  if (!baseLevel) {
    baseLevel = level;
  }
  var log = pino({
    name: name,
    level: level || "trace"
  }, pretty);
  return log;
};
