'use strict';

module.exports = function(tfsLocation, tfsRevision, outputBuildId) {
  return {
    key: {
      tfs: null,
      output: null,        
    }
    added: [],
    removed: []
  };
}
