'use strict';

module.exports = function(id) {
  return {
    _id: id,
    id: id,
    name: null,
    friendlyName: null,
    branch: null,
    latest: {
      tfs: null,
      output: null,
    },
    diff: {
      tfs: null,
      output: null,      
    },
    hasChanges: false
  };
}
