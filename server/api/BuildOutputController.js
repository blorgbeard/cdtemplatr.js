'use strict';

var Smb = require('smb2');
var Promise = require('bluebird');
Promise.config({longStackTraces: true});
var fs = require('fs');

var compare = require('../utils/compare.js');
var winauth = require('../conf/windowslogin.json');

var SHARE = "\\\\vistafp\\Data"; // "\\\\concorde\\temp";
var ROOT = "V4CDs\\InTesting";  // "root"

//var _smbReaddir = Promise.denodeify(SMB.readdir);
function smbReaddir(smb, path) {
  return new Promise(function(fulfill, reject) {

    smb = new Smb({
      share: SHARE,
      domain: winauth.domain,
      username: winauth.username,
      password: winauth.password
    });

    smb.readdir(path, function(err, files) {
      // todo: I am not handling errors properly here, I think.
      // I should reject the promise and catch the error further down.
      if (err) {
        console.log(path + ": " + err.toString() + " " + err.stack);
        return fulfill([]);
      }
      if (!files) {
        console.log("found null(?) files in " + path);
        return fulfill([]);
      }
      return fulfill(files);
    });
  });
}

function smbReadFile(smb, path) {
  return new Promise(function (fulfill, reject) {
    smb = new Smb({
      share: SHARE,
      domain: winauth.domain,
      username: winauth.username,
      password: winauth.password
    });
    console.log(path);
    var relativePath = path.slice(SHARE.length + 1);
    console.log(relativePath);
    smb.readFile(relativePath/* hack, todo fix properly */, function(err, data) {
      // todo: I am not handling errors properly here, I think.
      // I should reject the promise and catch the error further down.
      if (err) {
        console.log(path + ": " + err.toString() + " " + err.stack);
        return reject(err);
      }
      return fulfill(data);
    });
  });
}

var smbGetFolderList_Cache = null;

function smbGetFolderList(smb) {
  if (smbGetFolderList_Cache) return Promise.resolve(smbGetFolderList_Cache);
  return smbReaddir(smb, ROOT).then(result => {
    smbGetFolderList_Cache = result;
    return result;
  });
}

function getCdTemplate(smb, cdtemplatePath) {
  console.log(cdtemplatePath);
  return smbReadFile(smb, cdtemplatePath);
}

function smbReadFolder(smb, folder) {
  return smbReaddir(smb, ROOT + "\\" + folder);
}

function getFolder(smb, folderName) {
  return smbReadFolder(smb, folderName).then(function(content){
    return {name: folderName, content: content};
  });
}

var matchBuildFile = /(.+)_([0-9.]+)_(\d{8})\.(\d+)(_cdtemplate)?\.exe/;

function getOutputsFromFolder(folder) {
  // find every .exe file that looks like a build
  var outputFiles = (
    folder.content
    .map(t => t.match(matchBuildFile))
    .filter(t => t)
    .map(t => {
      var exePath = `${SHARE}\\${ROOT}\\${folder.name}\\${t[0]}`;
      var cdTemplatePath = exePath.slice(0, exePath.lastIndexOf('.')) + ".xml";
      return {
        name: t[1],
        version: t[2],
        date: t[3],
        number: t[4],
        cdtemplate: !!t[5],
        path: `${SHARE}\\${ROOT}\\${folder.name}`,
        exe: exePath,
        cdtemplatePath: cdTemplatePath

      };
    })
  );

  // order by name, version, date desc, number desc
  outputFiles.sort((b1, b2) => {
    var compareName = compare.asDefault(b1.name, b2.name);
    if (compareName != 0) return compareName;
    var compareVersion = compare.asVersion(b1.version, b2.version);
    if (compareVersion != 0) return compareVersion;
    var compareDate = compare.asDefault(b1.date, b2.date);
    if (compareDate != 0) return compareDate * -1;
    var compareNumber = compare.asDefault(b1.number, b2.number);
    if (compareNumber != 0) return compareNumber * -1;
    return 0;
  });

  // get the first build for each name/version
  //console.log(buildFiles[0].name);
  //console.log(JSON.stringify(buildFiles.map(t=>t.version)));
  var output = outputFiles.reduce(
    (previousValue, currentValue, currentIndex, array ) => {
      //console.log(JSON.stringify(previousValue.map(t=>t.version)) + " + " + currentValue.version);
      if (previousValue.length == 0) return [currentValue];
      var previous = previousValue.slice(-1).pop();
      if ((previous.name !== currentValue.name) || (previous.version !== currentValue.version)) {
        return previousValue.concat(currentValue);
      }
      return previousValue;
    }, []
  );

  return output;
}

function mapBuildFoldersToOutputs(folders) {
  var listOfListOfOutputs = folders.map(getOutputsFromFolder);
  var listOfOutputs = [].concat.apply([], listOfListOfOutputs); // flatten
  return listOfOutputs;
}

function createOutputsForFolders(smb, folders) {
  console.log("build output folder count: " + folders.length);
  return (
    Promise.all(folders.map((folder) => getFolder(smb, folder)))
    .then(mapBuildFoldersToOutputs)
  );
}

module.exports = class BuildOutputController {
  constructor() {
    this._smb = new Smb({
      share: SHARE,
      domain: winauth.domain,
      username: winauth.username,
      password: winauth.password
    });
  }

  getList() {
    return (
      smbGetFolderList(this._smb)
      .then((folders)=>createOutputsForFolders(this._smb, folders))
    );
  }

  getCdTemplate(path) {
    console.log(path);
    return getCdTemplate(this._smb, path);
  }
};
