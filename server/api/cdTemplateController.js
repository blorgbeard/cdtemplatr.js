'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});
var differ = require('diff');

var buildController = require('./buildController.js');

function splitFileToLines(file) {

}

function getCurrentDiff(id) {
  return Promise.all([
    buildController.getTfsCdTemplate(id),
    buildController.getOutputCdTemplate(id)
  ]).then(docs => {
    console.log(JSON.stringify(docs));
    var tfsVersion = docs[0].metadata.version;
    var tfsxml = docs[0].data;
    var outputxml = docs[1];
    var diff = differ.diffLines(tfsxml, outputxml);
    return diff;
  });
}

module.exports = {
  getCurrentDiff: getCurrentDiff
}
