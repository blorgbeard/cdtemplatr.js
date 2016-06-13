'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});

var httpntlm = require('httpntlm');
var winauth = require('../conf/windowslogin.json');

var TFS = "http://tfs:8080/tfs/Vista";
var PROJECT = "c1114d4d-f88a-4702-a3c0-4e06b8b0a5d4"; // Vista

function getApiUrl(resource, args) {
  var url = `${TFS}/${PROJECT}/_apis/${resource}?api-version=2.0`;
  if (args) {
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
    //console.log(`requesting ${url}`);
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

module.exports = {
  get: requestTfs
}
