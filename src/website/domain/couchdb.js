'use strict';

module.exports = function(db) {
  return {
    getBuilds: function() {
      return db.build.getAll();
    },
    getBuildDetails: function(id) {
      return db.build.get(id);
    },
    approveChanges: null
  };  
};
