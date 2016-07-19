'use strict';

var buildController = require('./production/buildController.js');

module.exports = {
  getBuilds: buildController.getList,
  getBuildDetails: buildController.getDetails,
  approveChanges: null
};
