'use strict';

module.exports = function(buildDefinitionId, tfsLocation, tfsRevision, outputBuildId) {
  return {
    _id: buildDefinitionId,
    buildDefinitionId: buildDefinitionId,
    version: {
      tfs: {
        location: tfsLocation,
        revision: tfsRevision
      },
      output: outputBuildId,
    },
    // todo: split changes into chunks for easy approval of related changes?
    data: {
      additions: [],
      deletions: []
    }
  };
}
