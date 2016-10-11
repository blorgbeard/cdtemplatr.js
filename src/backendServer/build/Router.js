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
    var data = file.data;
    if (data[0] == 0xFF && data[1] == 0xFE) {
      // hax: remove UTF16-LE BOM
      data = data.slice(2);
    } else if (data[0] == 0xEF && data[1] == 0xBB && data[2] == 0xBF) {
      // hax: remove UTF8 BOM
      data = data.slice(3);
    }
    let dataEncoding = 'ascii';
    if (data.length > 1 && data[1] == 0x00) {
      // "detect" 16-bit encoding 
      dataEncoding = 'ucs2';
    } else {
      dataEncoding = 'ascii';
    }
    var fileText = data.toString(dataEncoding);
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
