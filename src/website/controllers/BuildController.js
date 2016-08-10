'use strict';

var Promise = require('bluebird');

module.exports = function(domain) {
  return {
    all: function() {
      return domain.build.getAll();
    },
    get: function(id) {
      return Promise.all([
        domain.build.get(id),
        domain.diff.get(id)
      ]).spread((build, diff) => {
        return {
          build: build,
          diff: diff
        };
      });
    },
    approveChanges: null
  };  
};
