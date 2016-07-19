'use strict';

module.exports = function() {
  return {
    tfs: {
      location: null,
      revision: null,
      modified: null,
      data: null
    },
    output: {
      buildId: null,
      modified: null,
      data: null
    },
    diff: {
      tfs: {
        location: null,
        revision: null
      },
      output: {
        buildId: null
      },
      added: [],
      removed: []
    }
  };
}
