var Promise = require('bluebird');
var Smb = require('smb2');

var winauth = require('../conf/windowslogin.json');

var SHARE = "\\\\vistafp\\Data"; // "\\\\concorde\\temp";
var ROOT = "V4CDs\\InTesting";  // "root"

var SMB = new Smb({
  share: SHARE,
  domain: winauth.domain,
  username: winauth.username,
  password: winauth.password
});

Promise.config({
    longStackTraces: true
});

//var _smbReaddir = Promise.denodeify(SMB.readdir);
var _smbReaddir = function(path) {
  return new Promise(function(fulfill, reject) {
    SMB.readdir(path, function(err, files) {
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

function smbGetFolderList() {
  return _smbReaddir(ROOT);
}

function smbReadFolder(folder) {
  return _smbReaddir(ROOT + "\\" + folder);
}

function getFolder(folderName) {
  return smbReadFolder(folderName).then(function(content){
    return {name: folderName, content: content};
  });
}

function folderContainsValidBuild(folder) {
  // todo
  var isValid = (folder.content.length > 0);
  if (!isValid) {
    console.log(folder.name + " does not appear to contain a build.");
  }
  return isValid;
}

function filterOnlyValidBuildFolders(folders) {
  return folders.filter(folderContainsValidBuild);
}

function getBuildFromFolder(folder) {
  return {
    name: folder.name,
    version: 'todo'
  };
}

function mapBuildFoldersToBuilds(folders) {
  return folders.map(getBuildFromFolder);
}

function createBuildsForFolders(folders) {
  console.log("build folder count: " + folders.length);
  return (
    Promise.all(folders.map(getFolder))
      .then(filterOnlyValidBuildFolders)
      .then(mapBuildFoldersToBuilds)
  );
}

function getBuilds() {
  return smbGetFolderList().then(createBuildsForFolders);
}

module.exports = {
  getList: getBuilds
};
