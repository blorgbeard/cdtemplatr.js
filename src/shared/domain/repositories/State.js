'use strict';

var log = requireShared('Log')("repo/State");

module.exports = function(db) {
  return {    
    get: function(id) {
      return db.get(id).then(
        result => {
          log.trace(result, `get ${id} returned successfully.`)
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
    put: function(document) {
      return db.insert(document).then(result => {
        log.trace(`put ${document._id} created revision ${result.rev}`);
        return result;
      });
    }
  };
}
