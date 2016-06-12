'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});

var httpntlm = require('httpntlm');

var tfs = require('./tfsController.js');
var compare = require('../utils/compare.js');
var winauth = require('../conf/windowslogin.json');

function getBuildDetails(buildId) {
  return tfs.get(`/build/Definitions/${buildId}`).then(result => {
      // this field is double-encoded for some reason
      var mapping = result.repository.properties.tfvcMapping;
      var parsed = JSON.parse(mapping);
      result.repository.properties.tfvcMapping = parsed;
      return result;
  });
}

function parseTfsBuildList(tfsBuilds){
  var list = tfsBuilds.value;
  var extractVersion = /([0-9]+\.[0-9.]+)/;
  var result = list.map(t=>{
    var version = t.name.match(extractVersion);
    return {
      name: version && t.name.slice(0, version.index - 1) || t.name,
      version: version && version[1] || "",
      details: t
    }
  });
  result.sort((b1, b2) => {
    var compareName = compare.asDefault(b1.name, b2.name);
    if (compareName != 0) return compareName;
    var compareVersion = compare.asVersion(b1.version, b2.version);
    if (compareVersion != 0) return compareVersion;
    return 0;
  });
  return result;
}

function getBuildList() {
  return tfs.get("build/definitions").then(parseTfsBuildList);
}

module.exports = {
  getList: getBuildList,
  getDetails: getBuildDetails
}
