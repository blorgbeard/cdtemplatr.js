'use strict'

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});
var fs = require('fs');
var buildDefinitionController = require('./buildDefinitionController.js');
var tfs = require('./tfsController.js');
var compare = require('../utils/compare.js');
var cache = require('../utils/cache.js');

var cdTemplateLocationCache = cache.get('cdTemplateLocationCache', {});
var cdTemplateLocationByBuildId = cache.get('cdTemplateLocationByBuildId', {});

function loadFromTfs(path, recursionLevel) {
  return tfs.get('tfvc/items', {
    scopePath: path,
    recursionLevel: "OneLevel"
  }).then(result => {
    var folders = result.value.filter(t=>t.isFolder && t.path != path).map(t=>t.path);
    var files = result.value.filter(t=>!t.isFolder).map(t=>t.path);
    if (recursionLevel > 1) {
      return Promise.all(
        [Promise.resolve(files)].concat(
          folders.map(t => loadFromTfs(t, recursionLevel-1))
        )
      ).then(results => {
        // flatten one level
        return [].concat.apply([], results);
      });
    }
    return Promise.resolve(files);
  });
}

function loadCdTemplateLocation(path) {
  // todo: could be smart about subfolders
  var cache = cdTemplateLocationCache[path];
  if (cache) {
    //console.log(`loaded ${cache.length} cdtemplate locations from cache of ${path}.`);
    return Promise.resolve(cache);
  }
  return loadFromTfs(path, 2).then(result => {
    //console.log(`loaded ${result.length} entries from ${path}.`);
    var filtered = result.filter(t => t.toLowerCase().endsWith("cdtemplate.xml"));
    //console.log(`found ${filtered.length} cdtemplate locations in ${path}`);
    if (filtered.length > 1) {
      //console.log("!");
    }
    cdTemplateLocationCache[path] = filtered;
    return filtered;
  });
}

function lcs(lcstest, lcstarget) {
 var matchfound = 0
 var lsclen = lcstest.length
  for(var lcsi=0; lcsi<lcstest.length; lcsi++){
   var lscos=0
    for(var lcsj=0; lcsj<lcsi+1; lcsj++){
     var re = new RegExp("(?:.{" + lscos + "})(.{" + lsclen + "})", "i");
     var temp = re.test(lcstest);
     re = new RegExp("(" + RegExp.$1 + ")", "i");
     if(re.test(lcstarget)){
       matchfound=1;
       var result = RegExp.$1;
       break;
       }
     lscos = lscos + 1;
     }
     if(matchfound==1){return result; break;}
     lsclen = lsclen - 1;
   }
  result = "";
  return result;
 }

function getNameOverlap(name, path) {
  name = name.toLowerCase();
  path = path.toLowerCase();
  return lcs(name, path).length;
  /*
  while (name.length > 0) {
    var ix = path.lastIndexOf(name);
    if (ix > -1) return name.length;
    name = name.substring(0, name.lastIndexOf("_"));
  }
  return 0;
  /**/
}

function extractFilename(fullPath) {
  return fullPath.slice(fullPath.lastIndexOf('/') + 1);
}

function getCdTemplatePath(folder, projectName) {
  return loadCdTemplateLocation(folder).then(contents => {
    if (contents.length == 0) {
      return [];
    } else {
      //console.log(`candidates: ${contents}`);
      var candidates = contents.map(t => {
        return {
          value: t,
          fitness: getNameOverlap(projectName, extractFilename(t))
        };
      });
      return candidates;
    }
  });
}

function getTfsLocationOfCdTemplate(buildId) {
  // check the cache!
  var cache = cdTemplateLocationByBuildId[buildId];
  if (cache) {
    return Promise.resolve(cache);
  }

  return buildDefinitionController.getDetails(buildId).then(details => {
    var buildName = details.name;

    //console.log(`searching for cdtemplate for project ${buildName}`);

    var paths = details.repository.properties.tfvcMapping.mappings.map(t=>t.serverPath);

    // find the cdtemplate file.
    var paths = paths.filter(t => {
      if (t.startsWith("$/Internal")) return false;
      if (t.startsWith("$/SourceSafe")) return false;
      if (t.startsWith("$/PaymentConnectors")) return false;
      if (t.endsWith("/Assemblies")) return false;
      if (t.endsWith("/BuildData")) return false;
      if (t.indexOf("/Database/") > -1) return false;
      if (t.endsWith("/Cabinets")) return false;
      if (t.endsWith("/Common")) return false;
      if (t.indexOf("/CommonClient/") > -1) return false;
      if (t.indexOf("/CommonWeb/") > -1) return false;
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
    return Promise.all(paths.map(t => getCdTemplatePath(t, buildName))).then(paths => {
        var flat = [].concat.apply([], paths);
        var best = compare.max(flat, t=>t.fitness, compare.asDefault);
        //console.log(`decided on ${best.value}`);
        cdTemplateLocationByBuildId[buildId] = best.value;
        return best.value;
    });

    //.then(t=> actually load file, etc)

  });
}

module.exports = {
  getList: getTfsLocationOfCdTemplate
};
