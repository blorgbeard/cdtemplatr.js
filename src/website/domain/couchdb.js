'use strict';

module.exports = function(config) {
  return requireShared('Database')(config).then(db => {
    return {
      getBuilds: function() {
        return db.getAll();
      },
      getBuildDetails: function(id) {
        return db.get(id);
      },
      approveChanges: null
    };
  });
};
