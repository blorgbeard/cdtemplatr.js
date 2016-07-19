'use strict';

function wrapError(error) {
  return {
    error: error.toString(),
    stack: error.stack
  }
}

var bodyParser = require('body-parser');
var jsonBodyParser = bodyParser.json();

function createRouter(domain) {
  var router = require("express").Router();

  router.route('/builds').get((req, res) => domain.getBuilds().then(
    result => res.json(result),
    failure => res.json(wrapError(failure))
  ));

  router.route('/builds/details/:id').get((req, res) => domain.getBuildDetails(req.params.id).then(
    result => res.json(result),
    failure => res.json(wrapError(failure))
  ));

  router.route('/builds/approve/:id', jsonBodyParser).get((req, res) => {
    var additions = req.query.additions;//.map(t=>Number(t));
    var deletions = req.query.deletions;//.map(t=>Number(t));
    //console.log(JSON.stringify(additions));
    return domain.getBuildDetails(req.params.id).then(build => {
      //console.log("route: " + JSON.stringify(build));
      return domain.approveChanges(build, additions, deletions).then(
        result => res.json(result),
        failure => res.json(wrapError(failure))
      );
    });
  });

  return router;
}

module.exports = createRouter;
