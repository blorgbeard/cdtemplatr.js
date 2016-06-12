'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});

var httpntlm = require('httpntlm');
var winauth = require('../conf/windowslogin.json');

var BuildOutputController = require('./BuildOutputController.js');
var arrayJoin = require('../utils/arrayJoin.js');
var compare = require('../utils/compare.js');

var TFS = "http://tfs:8080/tfs/Vista";
var PROJECT = "c1114d4d-f88a-4702-a3c0-4e06b8b0a5d4"; // Vista

function getApiUrl(resource) {
  var url = `${TFS}/${PROJECT}/_apis/${resource}?api-version=2.0`;
  return url;
}

function requestTfs(resource) {
  return new Promise(function(fulfill, reject) {
    var url = getApiUrl(resource);
    console.log(`requesting ${url}`);
    httpntlm.get({
      url: url,
      workstation: "cdtemplatr",
      username: winauth.username,
      password: winauth.password,
      domain: winauth.domain
    }, function (err, res) {
      if (err) {
        return reject(err);
      }
      return fulfill(JSON.parse(res.body));
    });
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
    requestTfs("build/definitions").then(parseTfsBuildList),
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
  getList: function(callback) {
    return getBuildsWithFolders().asCallback(callback);
  }
}
