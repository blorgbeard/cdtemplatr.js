var router = require("express").Router();

router.route('/builds').get(getBuilds);

function getTag() {
  return Math.trunc(Math.random() * 100);
}

function getBuilds(req, res) {
  var data = [
    {key: 1, name: "PointOfSale", status:"OK", tag: getTag()},
    {key: 2, name: "Cinema", status:"SNAFU", tag: getTag()},
    {key: 3, name: "HeadOffice", status:"OK", tag: getTag()},
    {key: 4, name: "FilmProgramming", status:"32 additions / 3 deletions", tag: getTag()},
  ];
  res.json(data);
}

module.exports = router;
