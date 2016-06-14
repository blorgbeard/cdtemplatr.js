'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});

var buildController = require('./buildController.js');

function getCurrentDiff(id) {
  return Promise.all([
    buildController.getTfsCdTemplate(id),
    buildController.getOutputCdTemplate(id)
  ]).then(docs => {
    var tfsVersion = doc[0].version;
    var tfsxml = doc[0].content;
    var outputxml = doc[1];
  });
}
