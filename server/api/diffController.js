'use strict'

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});
var buildController = require('./buildController.js');
var tfs = require('./tfsController.js');
var compare = require('../utils/compare.js');

function getNameOverlap(name, path) {
  name = name.toLowerCase();
  path = path.toLowerCase();
  while (name.length > 0) {
    var ix = path.lastIndexOf(name);
    if (ix > -1) return name.length;
    name = name.substring(0, name.lastIndexOf("_"));
  }
  return 0;
}

function extractFilename(fullPath) {
  return fullPath.slice(fullPath.lastIndexOf('/') + 1);
}

function getCdTemplatePath(folder, projectName) {
  return tfs.get("tfvc/items", {
    scopePath: folder,
    recursionLevel:'OneLevel'
  }).then(contents => {
    var candidates = contents.value.filter(t =>
      !t.isFolder &&
      t.path.toLowerCase().endsWith("cdtemplate.xml") &&
      getNameOverlap(projectName, extractFilename(t.path)) > 0
    );
    if (candidates.length > 0) {
      return Promise.resolve(candidates[0].path);
    }
    return Promise.reject();
  });
}

function getDiffForBuild(buildId) {
  return buildController.getDetails(buildId).then(details => {
    var buildName = details.name;
    var paths = details.repository.properties.tfvcMapping.mappings.map(t=>t.serverPath);

    // find the cdtemplate file.
    var paths = paths.filter(t => {
      if (t.startsWith("$/Internal/")) return false;
      if (t.endsWith("/Assemblies")) return false;
      if (t.endsWith("/BuildData")) return false;
      if (t.endsWith("/Database")) return false;
      if (t.endsWith("/Cabinets")) return false;
      if (t.endsWith("/Common")) return false;
      if (t.endsWith("/CommonClient")) return false;
      if (t.endsWith("/CountryPacks")) return false;  // not sure if will fail for china build
      if (t.endsWith("/Images")) return false;
      if (t.endsWith("/SharedClasses")) return false;
      return true;
    });

    paths.sort((a,b) => {
      return compare.asDefault(getNameOverlap(buildName, b), getNameOverlap(buildName, a));
    })

    // look for a folder that matches the build name
    // look in each folder for an appropriately named cdtemplate.xml
    return (
      Promise.any(paths.map(t=>getCdTemplatePath(t, buildName)))
      //.then(t=> actually load file, etc)
    );
  });
}

module.exports = {
  getList: getDiffForBuild
};
