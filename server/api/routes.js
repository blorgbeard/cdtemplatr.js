var router = require("express").Router();
var buildController = require('./buildController.js');
var BuildOutputController = require('./BuildOutputController.js');
var cdtemplate = require('./cdTemplateController.js');

function getBuilds(req, res) {
  buildController.getList().then(
    builds => res.json(builds),
    error => res.json({error: error.toString(), stack: error.stack})
  );
}

function getBuildDetails(req, res) {
  buildController.getDetails(req.params.id).then(
    details => res.json(details),
    error => res.json({error: error.toString(), stack: error.stack})
  );
}

function getOutputs(req, res) {
  var outputs = new BuildOutputController();
  var promise = outputs.getList();
  return promise.then(
    result => res.json(result),
    error => res.json({error: error.toString(), stack: error.stack})
  );
}

router.route('/builds').get(getBuilds);
router.route('/builds/:id').get(getBuildDetails);

router.route("/cdtemplate/diff/:buildId").get((req, res) => {
  cdtemplate.getCurrentDiff(req.params.buildId).then(
    result => res.json(result),
    error => res.json({error: error.toString(), stack: error.stack})
  );
});

// todo: remove this later, not required for actual site - just used by build controller
router.route('/outputs').get(getOutputs);

module.exports = router;
