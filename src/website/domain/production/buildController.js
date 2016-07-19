'use strict';

var moment = require('moment');

// load once on startup - modify and save as we go
// todo: make this a dictionary with key as build id
var data = require('./data/builds.json');

var getBuilds_cacheDate = moment();
var getBuilds_cacheInvalidationAge = moment(1, "hours");

function getBuilds() {
  // todo: every hour or so, update the list in the background
  return Promise.resolve(data.map(build => {
    return {
      id: build.id,
      name: build.name,
      branch: build.branch,
      cdtemplate: !!build.output.cdtemplate
    };
  }))
}

function getBuildDetails(id) {
  var ix = data.findIndex(build => build.id == id);
  if (ix == -1) throw new Error(`build ${id} not found`);
  var build = data[ix];
  // update build from live server


  return Promise.resolve(build);
}

function approveChanges(build, additionIndexes, deletionIndexes) {
  // todo: send REST request to tfs, get new diff
}

module.exports = function(tfs) {

  this.getBuilds = function() {
    return tfs.getBuildDefinitions().then(result =>
      result.value.map(build => {
        id: build.id,
        name: build.name,
        branch: build.branch,
//      cdtemplate: !!build.output.cdtemplate   //
      })
    );
  };

  getBuildDetails: getBuildDetails,
  approveChanges: approveChanges
};
