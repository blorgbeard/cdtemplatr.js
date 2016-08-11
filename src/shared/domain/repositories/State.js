'use strict';

var log = requireShared('Log')("repo/State");

module.exports = function(db) {
  return {    
    get: function(id) {
      return db.get(id).then(
        result => {
          log.trace(`get ${id} returned ${result.value}.`)
          return result;
        },
        error => {
          if (error.statusCode === 404) {
            log.trace(`get ${id}: not found.`);
            return undefined;
          }
          throw error;
        }
      );
    },
    put: function(document) {
      return db.insert(document).then(result => {
        log.trace(`put ${document._id} created revision ${result.rev}`);
        return result;
      });
    },
    bump: function(id, value) {
      return db.atomic("state", "bump", id, value).then(result => {
        log.trace(`bump ${id} ${value} returned ${JSON.stringify(result)}`);
      });
    }
  };
}
