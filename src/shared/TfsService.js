'use strict';

var assert = require('assert');

var log = require('./Log')("TfsService");

// construct an url pointing to tfs
function getTfsBaseUrl(protocol, server, port, root, collection, project) {
  var projectUrlPart = (project) ? `/${project}` : "";
  return (
    `${protocol}://${server}:${port}/${root}/${collection}` +
    `${projectUrlPart}/_apis`
  );
}

// create the tfs service
function createTfs(config, winauth) {
  assert(config);
  assert(winauth);
  assert(log);

  config = config.tfs;
  log.debug(`Connecting to tfs: ${config.protocol}://${config.server}:${config.port}`);

  var NtlmRest = require('./services/ntlmrest.js');
  var Tfs = require('./services/tfs.js');
  // we don't know the project id yet, so we need to make one "special" request
  // to get it from Tfs. We do this directly through the Rest service, rather
  // than implementing support for it in the Tfs service.
  var baseUrl = getTfsBaseUrl(
      config.protocol, config.server, config.port,
      config.root, config.collection  // don't know project id yet
  );
  var restTfsNoProject = new NtlmRest(baseUrl, winauth);
  return restTfsNoProject.getObject(
    'projects', {apiVersion: "2.0"}
  ).then(projects => {
    var project = projects.value.filter(t => t.name == config.project);
    if (!project || project.length !== 1) {
      throw new Error(`Unable to find project "${config.project}" on server.`);
    }
    return project[0];
  }).then(project => {
    // now we've retrieved the id of the project that we'll use for all
    // subsequent requests, we can construct the actual Tfs service.
    var url = getTfsBaseUrl(
      config.protocol, config.server, config.port,
      config.root, config.collection, project.id  // now we know project id
    );
    var tfsService = new NtlmRest(url, winauth);
    var tfs = new Tfs(tfsService);
    return tfs;
  });
};

module.exports = createTfs;