var router = require("express").Router();

var diff = require("./diffController.js");

router.route("/cdtemplate/:buildId").get((req, res) => {
  diff.getList(req.params.buildId).then(
    result => res.json(result)
  );
});

module.exports = router;
