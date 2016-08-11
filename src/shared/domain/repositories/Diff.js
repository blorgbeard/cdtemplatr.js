'use strict';

var log = requireShared('Log')("repo/Diff");

module.exports = function Diff(db) {
  return {
    getDocumentRevision: function(buildDefinitionId) {
      return db.head(buildDefinitionId).then(
        result => {
          // trim leading and trailing quotes
          var rev = result.etag.replace(/^\"/, "").replace(/\"$/, "");
          log.trace(`Got current revision for diff ${buildDefinitionId}: ${rev}`);
          return rev;
        },
        error => {
          if (error.statusCode === 404) {
            // expected when inserting new doc
            return undefined;
          }
          throw error;
        }
      )
    },
    get: function(buildDefinitionId) {
      return db.get(buildDefinitionId).then(
        result => {
          log.trace(`get ${buildDefinitionId} returned successfully.`)
          return result;
        },
        error => {
          if (error.statusCode === 404) {
            return undefined;
          }
          throw error;
        }
      );
    },
    put: function(diff) {
      return db.insert(diff).then(result => {
        log.trace(`put ${diff._id} created revision ${result.rev}`);
        return result;
      });
    }
  };
}
