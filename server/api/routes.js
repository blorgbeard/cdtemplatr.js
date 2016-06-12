var router = require("express").Router();
var buildController = require('./buildController.js');
var BuildOutputController = require('./BuildOutputController.js');

function getBuilds(req, res) {
  buildController.getList().then(
    builds => res.json(builds),
    error => res.json(error)
  );
}

function getBuildDetails(req, res) {
  buildController.getDetails(req.params.id).then(
    details => res.json(details),
    error => res.json(error)
  );
}

function getOutputs(req, res) {
  var outputs = new BuildOutputController();
  var promise = outputs.getList();
  return promise.then(
    result => res.json(result),
    error => res.json(error)
  );
}

router.route('/builds').get(getBuilds);
router.route('/builds/:id').get(getBuildDetails);

// todo: remove this later, not required for actual site - just used by build controller
router.route('/outputs').get(getOutputs);

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
