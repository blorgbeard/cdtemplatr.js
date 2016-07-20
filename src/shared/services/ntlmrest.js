'use strict';

var Promise = require('bluebird');
var httpntlm = require('httpntlm');
var querystring = require('querystring');

var log = require('../Log')("ntlmrest");

module.exports = function(server, auth, ca) {

  // execute a get request to the specified path, using optional args dictionary
  this.get = function(path, args) {
    if (args.apiVersion) {
      args["api-version"] = args.apiVersion;
      delete(args.apiVersion);
    } else if (!args["api-version"]){
      log.warn(`No api-version specified for TFS request to ${path}`);
    }

    var params = querystring.encode(args);
    var url = `${server}/${path}`;
    if (params) url += `?${params}`;
    return new Promise(function(fulfill, reject) {
      log.trace(`Requesting ${url}`);
      httpntlm.get({
        url: url,
        workstation: auth.workstation,
        username: auth.username,
        password: auth.password,
        domain: auth.domain,
        ca: ca
      }, function (err, res) {
        if (err) {
          return reject(err);
        }
        return fulfill(res.body);
      });
    });
  };

  this.getObject = function(path, args) {
    return this.get(path, args).then(JSON.parse);
  }
};
