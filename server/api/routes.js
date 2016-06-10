var router = require("express").Router();
var buildController = require('./buildController.js');
var shareController = require('./shareController.js');

function getBuilds(req, res) {
  buildController.getList(function (err, builds) {
    if (err) {
      console.error(err);
      res.json(err);
    } else {
      var simpleList = builds.value.map(function(b){
        return {
          key: b.id,
          name: b.name
        };
      });
      res.json(simpleList);
    }
  });
}

function getShares(req, res) {
  shareController.getList(function (shares) {
    res.json(shares);
  });
}

router.route('/builds').get(getBuilds);
router.route('/shares').get(getShares);

module.exports = router;
