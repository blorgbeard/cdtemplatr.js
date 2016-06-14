var router = require("express").Router();
var builds = require('./buildController.js');
var cdtemplate = require('./cdTemplateController.js');
var cache = require("../utils/cache.js");

router.route("/cdtemplate/tfs/:buildId").get((req, res) => {
  builds.getTfsCdTemplate(req.params.buildId).then(
    result => {
      //console.log(JSON.stringify(result));
      res.json(result);
    },
    error => res.json({error: error.toString(), stack: error.stack})
  );
});

router.route("/cdtemplate/output/:buildId").get((req, res) => {
  builds.getOutputCdTemplate(req.params.buildId).then(
    result => res.send(result),
    error => res.json({error: error.toString(), stack: error.stack})
  );
});

router.route("/cdtemplate/diff/:buildId").get((req, res) => {
  cdtemplate.getCurrentDiff(req.params.buildId).then(
    result => res.json(result),
    error => res.json({error: error.toString(), stack: error.stack})
  );
});

router.route("/cache/get/:key").get((req, res) => {
  cache.get(req.params.key).then(
    results => res.json(results),
    failure => res.json({error: failure.toString()})
  );
});

router.route("/cache/delete/:key").get((req, res) => {
  cache.delete(req.params.key).then(
    success => res.json({success: true}),
    failure => res.json({error: failure.toString()})
  );
});

router.route("/cache/save").get((req, res) => {
  cache.save().then(
    success => res.json({success: true}),
    failure => res.json({error: failure.toString()})
  );
});

module.exports = router;
