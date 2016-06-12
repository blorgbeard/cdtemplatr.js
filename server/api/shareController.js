'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});

var Smb = require('smb2');

var winauth = require('../conf/windowslogin.json');

var SHARE = "\\\\vistafp\\Data"; // "\\\\concorde\\temp";
var ROOT = "V4CDs\\InTesting";  // "root"

//var _smbReaddir = Promise.denodeify(SMB.readdir);
function smbReaddir(smb, path) {
  return new Promise(function(fulfill, reject) {
    smb.readdir(path, function(err, files) {
      // todo: I am not handling errors properly here, I think.
      // I should reject the promise and catch the error further down.
      if (err) {
        console.log(path + ": " + err.toString());
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

function smbGetFolderList(smb) {
  return smbReaddir(smb, ROOT);
}

function smbReadFolder(smb, folder) {
  return smbReaddir(smb, ROOT + "\\" + folder);
}

function getFolder(smb, folderName) {
  return smbReadFolder(smb, folderName).then(function(content){
    return {name: folderName, content: content};
  });
}

var matchBuildFile = /(.+)_([0-9.]+)_(\d{8})\.(\d+)(_cdtemplate)?\.(\w+)/;

function filterOnlyValidBuildFolders(folders) {
  return folders.filter(t=>t);
}

function getBuildFromFolder(folder) {
  var buildFiles = folder.content.map(t=>t.match(matchBuildFile)).filter(t=>t);
  if (buildFiles.length == 0) return null;
  buildFiles.sort();
  var latestBuild = buildFiles.slice(-1).pop();
  var fields = {
    name: latestBuild[1],
    version: latestBuild[2],
    date: latestBuild[3],
    number: latestBuild[4],
    cdtemplate: !!latestBuild[5]
  };
  return fields;
}

function mapBuildFoldersToBuilds(folders) {
  return folders.map(getBuildFromFolder);
}

function createBuildsForFolders(smb, folders) {
  console.log("build folder count: " + folders.length);
  return (
    Promise.all(folders.map((folder) => getFolder(smb, folder)))
      .then(mapBuildFoldersToBuilds)
      .then(filterOnlyValidBuildFolders)
  );
}

module.exports = class ShareController {
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
      .then((folders)=>createBuildsForFolders(this._smb, folders))
    );
  }
};
