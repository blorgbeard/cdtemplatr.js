'use strict';

var buildController = require('./testing/buildController.js');

module.exports = {
  getBuilds: buildController.getBuilds,
  getBuildDetails: buildController.getBuildDetails,
  approveChanges: null
};
