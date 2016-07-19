'use strict';

var Smb = require('smb2');
var Promise = require('bluebird');
Promise.config({longStackTraces: true});
var fs = require('fs');

var parseBuildFilename = require('../../utils/parseBuildFilename.js');
var compare = require('../../utils/compare.js');
var winauth = require('../../conf/windowslogin.json');

var SHARE = "\\\\vistafp\\Data"; // "\\\\concorde\\temp";
var ROOT = "V4CDs\\InTesting";  // "root"

var matchBuildFile = /(.+)_([0-9.]+)_(\d{8})\.(\d+)(_cdtemplate)?\.exe/;

function smbListFiles(path) {
  var folder = splitUncPath(path);
  return new Promise(function(fulfill, reject) {
    smb = new Smb({
      share: folder.share,
      domain: winauth.domain,
      username: winauth.username,
      password: winauth.password
    });
    // todo: just use Promise.promisify?
    smb.readdir(folder.relativePath, function(err, files) {
      smb.close();
      if (err) return reject(err);
      return fulfill(files);
    });
  });
}

function smbReadFile(path) {
  var folder = splitUncPath(path);
  return new Promise(function (fulfill, reject) {
    smb = new Smb({
      share: folder.share,
      domain: winauth.domain,
      username: winauth.username,
      password: winauth.password
    });
    smb.readFile(folder.relativePath, function(err, data) {
      if (err) return reject(err);
      // hack: remove BOM(I think?)
      return fulfill(data.toString('ucs2').slice(1));
    });
  });
}

function splitUncPath(path) {
  var share = SHARE;
  let match = path.match(/^(\\\\[^\\]+\\[^\\]+)\\(.*)$/);
  if (!match) throw new Error(`Invalid path %{path}`);
  share = match[1];
  relativePath = match[2];
  return {share: share, relativePath: relativePath};
}

function getLatestOutputMetadata(build) {
  // todo: update every other build in this folder, since we're here
  return smbListFiles(build.outputLocation).then(files => {
    // todo: using the previous output information, find one that matches
  });
}

module.exports = {
//todo: need function to search for new builds..
  getLatestOutputMetadata: null,
  getLatestCdTemplateFile: null,
};
