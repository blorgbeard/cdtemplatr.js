'use strict';

var log = requireShared('Log')("repo/OutputCd");
var OutputCd = requireShared('model/OutputCd');

module.exports = function(db) {
  return {
    get: function(buildDefinitionId) {
      return db.get(buildDefinitionId).then(result => {
        result = result[0];
        log.trace(`get ${buildDefinitionId} returned data for build ${result.buildId}.`);
        return result;
      });
    },
    upsert: function(buildDefinitionId, buildId, data) {

      // todo: consider making the actual data an attachment instead of part of
      // the document. in some cases it will be up to 2MB of data.

      var doc = OutputCd(buildDefinitionId, buildId);
      doc.data = data;

      return db.head(buildDefinitionId).then(
        result => {
          // trim leading and trailing quotes
          var rev = result[1].etag.replace(/^\"/, "").replace(/\"$/, "");
          log.trace(`upsert ${buildDefinitionId} build ${buildId}; existing rev ${rev}.`);
          doc._rev = rev;
        },
        error => {
          if (error && error.statusCode == 404) {
            // expected when inserting new doc
            log.trace(`upsert ${buildDefinitionId} build ${buildId}; no existing doc.`);
          }
          else throw error;
        }
      ).then(() => {
        db.insert(doc).then(result => {
          var rev = result[0].rev;
          log.trace(`upsert ${buildDefinitionId} build ${buildId}; new rev ${rev}`);
          return rev;
        });
      });
    }
  };
}
