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
