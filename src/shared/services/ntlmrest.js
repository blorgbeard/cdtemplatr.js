'use strict';

var Promise = require('bluebird');
var httpntlm = require('httpntlm');
var querystring = require('querystring');

var log = require('../Log')("ntlmrest");

module.exports = function(server, auth, ca) {

  var sendRequest = function(method, path, queryArgs, requestArgs) {
    if (queryArgs.apiVersion) {
      queryArgs["api-version"] = queryArgs.apiVersion;
      delete(queryArgs.apiVersion);
    } else if (!queryArgs["api-version"]){
      log.warn(`No api-version specified for TFS request to ${path}`);
    }

    var params = querystring.encode(queryArgs);
    var url = `${server}/${path}`;
    if (params) url += `?${params}`;
    return new Promise(function(fulfill, reject) {
      log.trace(`Requesting ${url}`);
      var options = requestArgs || {};
      options.url = url;
      options.workstation = auth.workstation;
      options.username = auth.username;
      options.password = auth.password;
      options.domain = auth.domain;
      options.ca = ca;
      httpntlm.method(method, options, (err, res) => {
        if (err) {
          return reject(err);
        }
		if (res.statusCode >= 200 && res.statusCode < 300) {
			return fulfill(res.body);
		}
		return reject({url: url, res: res});
      });
    });
  } 

  this.get = (path, args) => sendRequest("get", path, args);
  this.getObject = (path, args) => sendRequest("get", path, args).then(JSON.parse);  
  
  this.post = (path, args, body, headers) => sendRequest("post", path, args, {
    body: body,
    headers: headers
  });  
};
