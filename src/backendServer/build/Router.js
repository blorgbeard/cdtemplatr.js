'use strict';

var log = requireShared('Log')("outputs/router");

module.exports = function(controller) {

  var router = require('express').Router();
  var fileupload = require('express-fileupload');

  router.post('/:buildId', fileupload(), (req, res) => {
    if (!req.files || Object.keys(req.files).length !== 1) {
      res.status(400).send('Please upload a single file.').end();
      return;
    }
    var file = req.files[Object.keys(req.files)[0]];
    log.trace(`POST build=${req.params.buildId} (path=${req.query.tfs}); received ${file.name} (${file.data.length} bytes).`);
    var fileText = file.data.toString('ucs2');
    controller.addBuildOutput(req.params.buildId, fileText, req.query.tfs).then(
      result => res.status(200).end(),
      error => {
        log.error(error, "Failure handling cdtemplate post.");
        res.status(500).send(JSON.stringify(error)).end();
      }
    );
  });

  return router;
};
