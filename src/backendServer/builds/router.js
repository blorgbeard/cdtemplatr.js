'use strict';

var log = requireShared('Log')("router");

module.exports = function(controller) {
  var router = require('express').Router();
  var bodyParser = require('body-parser');

  router.put('/:buildname/cdtemplate-path', bodyParser.text(), (req, res) => {
    log.trace(req.body, `PUT ${req.originalUrl}`);
    controller.update(req.params["buildname"], req.body).then(
      () => res.json({ok: true}),
      (err) => res.json({ok: false, error: err})
    );
    
  });

  return router;
};
