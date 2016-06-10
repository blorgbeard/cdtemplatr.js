var router = require("express").Router();

// Builds
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

// New Artefacts
router.route('/newArtefacts').get(GetNewArtefacts);

function GetNewArtefacts(req, res){
  var data = [
    {key: 1, name: "\\_Install_Customisation\\Customers\\Brazil\\Domain\\Vista.Circuit.Domain.Brazil\\bin\\Vista.Brazil.TaxNumber.Common.dll"},
    {key: 2, name: "\\_Install_Customisation\\Customers\\Brazil\\Domain\\Vista.Circuit.Domain.Brazil\\bin\\Vista.Environment.OnPremise.FileUtilities.dll"},
    {key: 3, name: "\\_Install_Customisation\\Customers\\Brazil\\Domain\\Vista.Circuit.Domain.Brazil\\bin\\Vista.KeyValueStore.Extended.dll"},
    {key: 4, name: "\\_Install_Customisation\\Customers\\Brazil\\Vista.Brazil.AccountantMaint\\bin\\Vista.Brazil.TaxNumber.Common.dll"},
    {key: 5, name: "\\_Install_Customisation\\Customers\\Brazil\\Vista.Brazil.AccountantMaint\\bin\\Vista.Environment.OnPremise.FileUtilities.dll"},
    {key: 6, name: "\\_Install_Customisation\\Customers\\Brazil\\Vista.Brazil.AccountantMaint\\bin\\Vista.KeyValueStore.Extended.dll"}
  ];
  res.json(data);
}

module.exports = router;
