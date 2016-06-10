var router = require("express").Router();

router.route('/builds').get(getBuilds);

function getBuilds(req, res) {
  var data = [
    {id: 1, name: "PointOfSale", status:"OK"},
    {id: 2, name: "Cinema", status:"SNAFU"},
    {id: 3, name: "HeadOffice", status:"OK"},
    {id: 4, name: "FilmProgramming", status:"32 additions / 3 deletions"},
  ];
  res.json(data);
}

module.exports = router;
