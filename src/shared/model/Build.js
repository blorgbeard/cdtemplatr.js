'use strict';

module.exports = function(id) {
  return {
    _id: id,
    id: id,
    name: null,
    friendlyName: null,
    branch: null,
    tfs: null,
    output: null,
  };
}
