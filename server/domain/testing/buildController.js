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
  return Promise.resolve(data.filter(build => build.id == id)[0]);
}

module.exports = {
  getBuilds: getBuilds,
  getBuildDetails: getBuildDetails
};
