'use strict';

var log = requireShared('Log')("controller");
var Promise = require('bluebird');

module.exports = function(config) {
  return requireShared('Database')(config).then(db => ({
    update: function(buildId, path) {
      log.debug(`update ${buildId} ${path}: updating database.`);
      return db.build.updateTfsPath(buildId, path);
    }
  }));
};
