'use strict';

var log = requireShared('Log')("outputs/controller");
var Promise = require('bluebird');

module.exports = function(db, tfs) {
  return {
    addBuildOutput: function(buildId, cdtemplate, path) {
      log.debug(`addBuildOutput ${buildId} (${path}).`);

      // get the build details from tfs so we can get the definition id
      return tfs.getBuild(buildId).then(
        build => {
          var buildDefinitionId = "" + build.definition.id;
          // upload the new output to the database
          return db.outputCd.upsert(buildDefinitionId, buildId, cdtemplate).then(() => {
            // update the cdtemplate path in the database
            return db.build.updateTfsPath(buildDefinitionId, path);
          });
        }
      );      
    }
  };
};
