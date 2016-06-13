var router = require("express").Router();

var diff = require("./diffController.js");

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

module.exports = router;
