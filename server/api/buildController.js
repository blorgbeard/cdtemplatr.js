'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});

var buildDefinitionController = require('./buildDefinitionController.js');
var BuildOutputController = require('./BuildOutputController.js');
var diffController = require('./diffController.js');

var arrayJoin = require('../utils/arrayJoin.js');
var compare = require('../utils/compare.js');
var cache = require('../utils/cache.js');

var buildsCache = cache.get('buildsCache', {value: null});

function humanizeProjectName(input) {
  var camelCaseToSpace = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g
  return (input
    .replace(camelCaseToSpace, '$1$4 $2$3$5')
    .replace(/_/g, ' ')
    .replace(/ (Dev|Main|Priv)$/, ' ($1)')
  );
}

function joinBuildAndOutput(build, output, diff) {
  return {
    key: build.details.id,
    name: humanizeProjectName(output.name),
    branch: build.version,
    version: output.version,
    date: output.date,
    number: output.number,
    cdtemplate: output.cdtemplate,
    buildFolder: output.path,
    cdtemplateLocation: diff
  };
}

function joinBuildsAndOutputs(builds, outputs) {
  var result = arrayJoin.join1tofirst2(
    builds, outputs,
    function(build, output) {
      var compareName = compare.asDefault(build.name, output.name);
      if (compareName != 0) return compareName;
      var compareVersion = compare.asVersionPrefix(build.version, output.version)
      if (compareVersion != 0) return compareVersion;
      return 0;
    },
    function (build, output) { return {build: build, output: output}; }
  );
  return result;
}

function joinBuildsAndOutputsAndGetCdTemplate(builds, outputs) {
  // following code relies on sort order of builds and outputs -
  // as defined in the code that returns them!

  // each build from tfs should be matched with the first matching output
  var result = joinBuildsAndOutputs(builds, outputs);

  var promises = result.map(t => {
    return diffController.getList(t.build.details.id).then(
      diffs => {
        return {build:t.build, output: t.output, cdtemplateLocation: diffs};
      },
      error => {
        if (error) console.log(error.toString());
        return {build:t.build, output: t.output, cdtemplateLocation: "unknown"};
      }
    ).then(stuff =>
      joinBuildAndOutput(stuff.build, stuff.output, stuff.cdtemplateLocation)
    );
  });

  return Promise.all(promises);
}

function getBuildsWithFolders(buildListPromise) {
  var outputs = new BuildOutputController();
  return Promise.all([
    buildListPromise,
    outputs.getList()
  ]).spread(joinBuildsAndOutputsAndGetCdTemplate);
}

function getList() {
  if (buildsCache.value) {
    return Promise.resolve(buildsCache.value);
  }
  return getBuildsWithFolders(buildDefinitionController.getList()).then(result => {
    buildsCache.value = result;
    return result;
  });
}

function getDetails(id) {
  if (buildsCache.value && buildsCache.value[id]) {
    return Promise.resolve([buildsCache.value[id]]);
  }
  return getBuildsWithFolders(buildDefinitionController.getList().then(t => t.filter(b => b.id == id)));
}

module.exports = {
  getList: getList,
  getDetails: getDetails
}
