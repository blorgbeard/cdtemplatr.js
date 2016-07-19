'use strict';

var Promise = require('bluebird');
var log = require('../Log')("ntlmrest");

function decodeTfsFile(data) {
  // hack: clean out UTF-8 replacement characters caused by weird encoding
  // don't know where they are coming from, possibly dodgy httpntlm library
  // then decode as ucs2 (the subset of utf16 that nodejs supports)
  var buffer = new Buffer(data);
  var decoded = buffer.slice(6).toString('ucs2');
  //console.log(decoded.slice(0, 80));
  return decoded;
}

module.exports = function(service) {

  // download a file (at the latest version).
  this.getFile = function(path) {
    return service.get('tfvc/items', {
      apiVersion: "1.0",
      path: path
    }).then(data => {
      var result = decodeTfsFile(data);
      log.trace(`getFile ${path} returned ${result.length} characters.`);
      return result;
    });
  };

  // download a file at the specified version (changeset).
  this.getFileAtVersion = function(path, version) {
    return service.get('tfvc/items', {
      apiVersion: "1.0",
      path: path,
      version: version,
      versionType: "changeset"
    }).then(data => {
      var result = decodeTfsFile(data);
      log.trace(`getFileAtVersion ${path} (C${version}) returned ${result.length} characters.`);
      return result;
    });
  };

  // get metadata for a file.
  this.getFileMetadata = function(path) {
    return service.getObject('tfvc/items', {
      apiVersion: "1.0",
      scopePath: path
    }).then(metadata => {
      metadata = metadata.value[0];
      log.trace(metadata, `getFileMetadata ${path} returned successfully.`)
      return metadata;
    });
  };

  // get {metadata: metadata, data: data} for a file (at latest version).
  this.getFileWithMetadata = function(path) {
    return getFileMetadata(service, path).then(metadata => {
      var version = metadata.version;
      return getFileAtVersion(service, path, version).then(data => {
        return {metadata: metadata, data: data}
      });
    })
  };

  // get the list of files inside a folder (at the latest version).
  this.getFolderContents = function(path) {
    return service.getObject('tfvc/items', {
      apiVersion: "1.0",
      scopePath: path
    }).then(result => {
      result = result.value;
      log.trace(`getFolderContents ${path} returned ${result.length} items.`);
      return result;
    });
  };

  // get metadata for a folder.
  this.getFolderMetadata = function(path) {
    return service.getObject('tfvc/items', {
      apiVersion: "1.0",
      path: path
    }).then(metadata => {
      log.trace(metadata, `getFolderMetadata ${path} returned successfully.`)
      return metadata;  // should be .value[0]?
    });
  }

  // get list of build definitions
  this.getBuildDefinitions = function() {
    return service.getObject("build/definitions", {
      apiVersion: "2.0"
    }).then(result => {
      result = result.value;
      log.trace(`getBuildDefinitions returned ${result.length} entries`);
      return result;
    });
  }

  // get details for a build definition by id
  this.getBuildDefinition = function(id) {
    return service.getObject(`build/definitions/${id}`, {
      apiVersion: "2.0"
    }).then(result => {
      log.trace(result, `getBuildDefinition ${id} returned successfully.`);
      return result;
    });
  }

  // get details for a build by id
  this.getBuild = function(id) {
    return service.getObject(`build/builds/${id}`, {
      apiVersion: "2.0"
    }).then(result => {
      log.trace(result, `getBuild ${id} returned successfully.`);
      return result;
    });
  }

};
