'use strict';

module.exports = function(buildDefinitionId, buildId) {
  return {
    _id: buildDefinitionId,
    buildDefinitionId: buildDefinitionId,
    buildId: buildId,
    data: null,
  };
};
