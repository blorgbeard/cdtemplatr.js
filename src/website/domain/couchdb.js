'use strict';

module.exports = function(config) {
  return requireShared('Database')(config).then(db => {
    return {
      getBuilds: function() {
        return db.build.getAll();
      },
      getBuildDetails: function(id) {
        return db.build.get(id);
      },
      approveChanges: null
    };
  });
};
