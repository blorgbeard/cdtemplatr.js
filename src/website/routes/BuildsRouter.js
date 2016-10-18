'use strict';

var log = requireShared('Log')("BuildsRouter");

function wrapError(error) {
  return {
    error: error.toString(),
    stack: error.stack
  }
}

var bodyParser = require('body-parser');
var jsonBodyParser = bodyParser.json();

function createRouter(controller) {
  var router = require("express").Router();

  router.route('/').get((req, res) => controller.all().then(
    result => res.json(result),
    failure => res.json(wrapError(failure))
  ));

  router.route('/:id').get((req, res) => controller.get(req.params.id).then(
    result => res.json(result),
    failure => res.json(wrapError(failure))
  ));

  router.route('/:id/commit', jsonBodyParser).post((req, res) => {
    var body = req.body;
    controller.commit(req.params.id, body).then(
      result => res.json(result),
      failure => res.json(wrapError(failure))
    );
  });

  router.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  return router;
}

module.exports = createRouter;
