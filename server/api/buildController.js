'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});

var httpntlm = require('httpntlm');
var winauth = require('../conf/windowslogin.json');

var tfs = require('./tfsController.js');
var BuildOutputController = require('./BuildOutputController.js');
var arrayJoin = require('../utils/arrayJoin.js');
var compare = require('../utils/compare.js');

function getBuildDetails(buildId) {
  return tfs.get(`/build/Definitions/${buildId}`).then(result => {
      // this field is double-encoded for some reason
      var mapping = result.repository.properties.tfvcMapping;
      var parsed = JSON.parse(mapping);
      result.repository.properties.tfvcMapping = parsed;
      return result;
  });
}

function humanizeProjectName(input) {
  var camelCaseToSpace = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g
  return (input
    .replace(camelCaseToSpace, '$1$4 $2$3$5')
    .replace(/_/g, ' ')
    .replace(/ (Dev|Main|Priv)$/, ' ($1)')
  );
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

function getBuildsWithFolders() {
  var outputs = new BuildOutputController();
  return Promise.all([
    tfs.get("build/definitions").then(parseTfsBuildList),
    outputs.getList()
  ]).spread(function (builds, outputs) {
      // following code relies on sort order of builds and outputs -
      // as defined in the code that returns them!

      // each build from tfs should be matched with the first matching output
      var result = arrayJoin.join1tofirst2(
        builds, outputs,
        function(build, output) {
          var compareName = compare.asDefault(build.name, output.name);
          if (compareName != 0) return compareName;
          var compareVersion = compare.asVersionPrefix(build.version, output.version)
          if (compareVersion != 0) return compareVersion;
          return 0;
        },
        function (build, output) {
          return {
            key: build.details.id,
            name: humanizeProjectName(output.name),
            branch: build.version,
            version: output.version,
            date: output.date,
            number: output.number,
            cdtemplate: output.cdtemplate
          };
        }
      );
      return result;
  });
}

module.exports = {
  getList: getBuildsWithFolders,
  getDetails: getBuildDetails
}
