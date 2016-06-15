'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});

var httpntlm = require('httpntlm');
var winauth = require('../../conf/windowslogin.json');

var TFS = "http://tfs:8080/tfs/Vista";
var PROJECT = "c1114d4d-f88a-4702-a3c0-4e06b8b0a5d4"; // Vista

function getApiUrl(resource, args) {
  var url = `${TFS}/${PROJECT}/_apis/${resource}?api-version=2.0`;
  if (args) {
    console.log(JSON.stringify(args));
    for (var key in args) {
      if (key && args[key]) {
        url += `&${encodeURIComponent(key)}=${encodeURIComponent(args[key])}`;
      }
    }
  }
  return url;
}

function requestTfs(resource, args) {
  return new Promise(function(fulfill, reject) {
    var url = getApiUrl(resource, args);
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
      try {
        //console.log(JSON.stringify(res));
        return fulfill(res.body);
      } catch (error) {
        return reject(error);
      }
    });
  });
}

function getJson(resource, args) {
  return requestTfs(resource, args).then(result => {
    var json = JSON.parse(result);
    return json;
  });
}

function decodeTfsFile(data) {
  // hack: clean out UTF-8 replacement characters caused by weird encoding
  // don't know where they are coming from, possibly dodgy httpntlm library
  // then decode as ucs2 (the subset of utf16 that nodejs supports)
  var buffer = new Buffer(data);
  var decoded = buffer.slice(6).toString('ucs2');
  //console.log(decoded.slice(0, 80));
  return decoded;
}

function getFile(path) {
  console.log(`getting file ${path}`);
  return requestTfs('tfvc/items', {
    path: path
  }).then(decodeTfsFile);
}

function getFileAtVersion(path, version) {
  console.log(`getting file ${path} at version C${version}`);
  return requestTfs('tfvc/items', {
    path: path,
    version: version,
    versionType: "changeset"
  }).then(decodeTfsFile);
}

function getFileMetadata(path) {
  return getJson('tfvc/items', {
    scopePath: path
  }).then(metadata => metadata.value[0]);
}

function getFileWithMetadata(path) {
  return getFileMetadata(path).then(metadata => {
    var version = metadata.version;
    return getFileAtVersion(path, version).then(data => {
      return {metadata: metadata, data: data}
    });
  })
}

module.exports = {
  get: getJson,
  getFile: getFile,
  getFileWithMetadata: getFileWithMetadata
}
