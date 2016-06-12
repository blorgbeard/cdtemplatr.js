'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});

var httpntlm = require('httpntlm');
var winauth = require('../conf/windowslogin.json');

var ShareController = require('./shareController.js');
var arrayJoin = require('../utils/arrayJoin.js');

var TFS = "http://tfs:8080/tfs/Vista";
var PROJECT = "c1114d4d-f88a-4702-a3c0-4e06b8b0a5d4"; // Vista

function getApiUrl(resource) {
  var url = `${TFS}/${PROJECT}/_apis/${resource}?api-version=2.0`;
  return url;
}

function requestTfs(resource) {
  return new Promise(function(fulfill, reject) {
    var url = getApiUrl(resource);
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
      return fulfill(JSON.parse(res.body));
    });
  });
}

function humanizeProjectName(input) {
  var camelCaseToSpace = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g
  return (input
    .replace(camelCaseToSpace, '$1$4 $2$3$5')
    .replace(/_/g, ' ')
    .replace(/ (Dev|Main)$/, ' ($1)')
  );
}

function getBuildsWithFolders() {
  var shares = new ShareController();
  return Promise.all([
    requestTfs("build/definitions").then(function(result) { return result.value; }),
    shares.getList()
  ]).spread(function (builds, folders) {
      var result = arrayJoin(
        builds, folders, 'name', function (build, folder) {
          return {
            key: build.id,
            name: humanizeProjectName(folder.name)
          };
        }
      );
      return result;
  });
}

module.exports = {
  getList: function(callback) {
    return getBuildsWithFolders().asCallback(callback);
  }
}
