'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});

var buildDefinitionController = require('./buildDefinitionController.js');
var BuildOutputController = require('./BuildOutputController.js');
var tfsCdTemplateLocator = require('./tfsCdTemplateLocator.js');
var tfs = require('./tfsController.js');

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

function joinBuildAndOutput(build, output, tfsCdTemplateLocation) {
  return {
    key: build.details.id,
    name: humanizeProjectName(output.name),
    branch: build.version,
    version: output.version,
    date: output.date,
    number: output.number,
    buildFolder: output.path,
    exePath: output.exe,
    cdtemplate: output.cdtemplate,
    outputCdTemplateLocation: output.cdtemplatePath,
    tfsCdTemplateLocation: tfsCdTemplateLocation
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
    return tfsCdTemplateLocator.getLocation(t.build.details.id).then(
      location => {
        return {build:t.build, output: t.output, cdtemplateLocation: location};
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
  return getBuildsWithFolders(buildDefinitionController.getList().then(t => {
    return t.filter(b => b.id == id);
  }));
}

function getTfsCdTemplate(id) {
  console.log(`get template for ${id}`);
  var details = getDetails(id);
  return details.then(build => {
    console.log(JSON.stringify(build));
    return tfs.getFileWithMetadata(build[0].tfsCdTemplateLocation);
  })
}

function getOutputCdTemplate(id) {
  var outputs = new BuildOutputController();
  console.log(`get template for ${id}`);
  var details = getDetails(id);
  return details.then(build => {
    console.log(JSON.stringify(build));
    return outputs.getCdTemplate(build[0].outputCdTemplateLocation);
  });
}

module.exports = {
  getList: getList,
  getDetails: getDetails,
  getTfsCdTemplate: getTfsCdTemplate,
  getOutputCdTemplate: getOutputCdTemplate
}
