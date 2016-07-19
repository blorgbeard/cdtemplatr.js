'use strict';

var baseLogger = null;

module.exports = function(name, level) {
  if (baseLogger == null) {
    var pino = require('pino');
    var pretty = pino.pretty();
    pretty.pipe(process.stdout);
    var log = pino({
      name: name,
      level: level || "trace"
    }, pretty);
    baseLogger = log;
    return log;
  }
  log = baseLogger.child({
    name: name,
    level: level
  });
  return log;
};
