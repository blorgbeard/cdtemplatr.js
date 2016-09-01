'use strict';

var Promise = require('bluebird');
var log = requireShared('Log')("TfsService");

function decodeTfsFile(text) {
  // todo: fix all this text encoding rubbish properly.    
  if (text.startsWith("��")) {
    // hack: clean out UTF-8 replacement characters (probably) caused by httpntlm
    // failing to recognise BOM.
    var sliced = text.slice(2);    
    var buffer = new Buffer(sliced, "binary");
    var encoded = buffer.toString("ucs2");
    return encoded;
  }
  if (text.slice(0,1) === "﻿") {
    // hack: also detect and remove UTF-8 BOM
    return text.slice(1);
  }
  // hopefully it's a standard node string then.
  return text;
}

module.exports = function(service) {

  this.url = service.url;

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
    }).then(result => {
      if (!result.value) {
        var error = Error(`${result.typeKey}: ${result.message}`);
        error.response = result;
        throw error;
      }
      var metadata = result.value[0];
      log.trace(metadata, `getFileMetadata ${path} returned successfully.`)
      return metadata;
    });
  };

  // get {metadata: metadata, data: data} for a file (at latest version).
  this.getFileWithMetadata = function(path) {
    return this.getFileMetadata(path).then(metadata => {
      var version = metadata.version;
      return this.getFileAtVersion(path, version).then(data => {
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
      log.trace(`getBuildDefinitions returned ${result.length} entries.`);
      return result;
    });
  }

  // get details for a build definition by id
  this.getBuildDefinition = function(id) {
    return service.getObject(`build/definitions/${id}`, {
      apiVersion: "2.0"
    }).then(result => {
      log.trace(`getBuildDefinition ${id} returned successfully.`);
      return result;
    });
  }

  // get details for a build by id
  this.getBuild = function(id) {
    return service.getObject(`build/builds/${id}`, {
      apiVersion: "2.0"
    }).then(result => {
      log.trace(`getBuild ${id} returned successfully.`);
      return result;
    });
  }

  // get list of subscriptions (event hooks)
  this.getSubscriptions = function() {
    return service.getObject("subscriptions", {
      apiVersion: "1.0"
    }).then(result => {
      result = result.value;
      log.trace(`getSubscriptions returned ${result.length} entries.`);
      return result;
    });
  };

  this.addSubscription = function(doc) {
    return service.post("subscriptions", {
      apiVersion: "1.0"
    }, JSON.stringify(doc), {
      "Content-Type": "application/json"
    });
  }

};
