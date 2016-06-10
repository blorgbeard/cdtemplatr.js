var router = require("express").Router();
var buildController = require('./buildController.js');

router.route('/builds').get(getBuilds);

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

module.exports = router;
