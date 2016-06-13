var router = require("express").Router();

var diff = require("./diffController.js");
var cache = require("../utils/cache.js");

router.route("/cdtemplate/:buildId").get((req, res) => {
  diff.getList(req.params.buildId).then(
    result => res.json(result),
    error => res.json({error: error.toString(), stack: error.stack})
  );
});

router.route("/cdTemplateLocationCache/save").get((req, res) => {
  diff.saveCache();
  res.json({result: "OK"});
});

router.route("/cdTemplateLocationCache/clear").get((req, res) => {
  diff.clearCache();
  res.json({result: "OK"});
});


router.route("/cache/get/:key").get((req, res) => {
  cache.get(req.params.key).then(
    results => req.json(results),
    failure => req.json({error: failure.toString()})
  );
});

router.route("/cache/delete/:key").get((req, res) => {
  cache.delete(req.params.key).then(
    success => req.json({success: true}),
    failure => req.json({error: failure.toString()})
  );
});

router.route("/cache/persist").get((req, res) => {
  cache.persist().then(
    success => req.json({success: true}),
    failure => req.json({error: failure.toString()})
  );
});

module.exports = router;
