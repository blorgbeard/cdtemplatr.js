'use strict';

var log = requireShared('Log')("outputs/controller");
var Promise = require('bluebird');
var xml2js = require('xml2js');
var parseString = Promise.promisify(xml2js.parseString);

module.exports = function(db, tfs) {
  return {
    addBuildOutput: function(buildDefinitionId, buildId, cdtemplate, path) {
      log.debug(`addBuildOutput ${buildDefinitionId} ${buildId} (${path}).`);

      // upload the new output to the database
      return db.outputCd.upsert(buildDefinitionId, buildId, cdtemplate).then(() => {
        // update the cdtemplate path in the database
        return db.build.updateTfsPath(buildDefinitionId, path);
      });
    }
  };
};
