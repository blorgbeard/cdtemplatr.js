function wrapError(error) {
  return {
    error: error.toString(),
    stack: error.stack
  }
}

function createRouter(domain) {
  var router = require("express").Router();

  router.route('/builds').get((req, res) => domain.getBuilds().then(
    result => res.json(result),
    failure => res.json(wrapError(failure))
  ));

  router.route('/builds/:id').get((req, res) => domain.getBuildDetails(req.params.id).then(
    result => res.json(result),
    failure => res.json(wrapError(failure))
  ));

  return router;
}

module.exports = createRouter;
