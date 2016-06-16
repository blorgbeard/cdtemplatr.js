'use strict'

var data = require('./data/builds.json');

function getBuilds() {
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
  var matches = data.filter(build => build.id == id);
  var build = matches[0];
  //console.log("getBuildDetails: " + JSON.stringify(build));
  return Promise.resolve(build);
}

function approveChanges(build, additionIndexes, deletionIndexes) {
  //console.log("approveChanges: " + JSON.stringify(build));
  if (additionIndexes) {
    console.log(JSON.stringify(additionIndexes));
    build.cdtemplate.additions = build.cdtemplate.additions.filter((line, index) => {
      console.log(JSON.stringify(index));
      var lineInList = additionIndexes.filter(t => t == index).length > 0;
      return !lineInList;
    });
  }
  if (deletionIndexes) {
    build.cdtemplate.deletions = build.cdtemplate.deletions.filter((line, index) => {
      var lineInList = deletionIndexes.filter(t => t == index).length > 0;
      return !lineInList;
    });
  }

  if (build.cdtemplate.additions.length == 0 && build.cdtemplate.deletions.length == 0) {
    // this is silly. builds having no diffs should appear exactly the same way,
    // rather than pretending they have no cdtemplate on v:\
    build.output.cdtemplate = null;
  }

  // update in memory, but not disk
  data = data.map(t => t.id == build.id ? build : t);

  return Promise.resolve(`Committed ${build.name} ${build.branch} template changes`);// as ${ntlm.UserName}`);
}

module.exports = {
  getBuilds: getBuilds,
  getBuildDetails: getBuildDetails,
  approveChanges: approveChanges
};
