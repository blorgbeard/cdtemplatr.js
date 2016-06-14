'use strict';

var Promise = require('bluebird');
Promise.config({
    longStackTraces: true
});
var differ = require('diff');

var buildController = require('./buildController.js');

function splitFileToLines(file) {

}

function readChunks(chunks) {
  var result = (
    chunks.map(chunk => chunk.value.trim().split('\r\n')
      .filter(line => line && line.startsWith('<file '))
      .map(line => {
        var match = line.match(/<file name="(.*)"\/>/);
        if (match) return match[1];
        return "!!!" + line + "!!!";
      })
    )
  );
  result = [].concat.apply([], result); // flatten
  return result;
}

function getCurrentDiff(id) {
  return Promise.all([
    buildController.getTfsCdTemplate(id),
    buildController.getOutputCdTemplate(id)
  ]).then(docs => {
    //console.log(JSON.stringify(docs));
    var tfsVersion = docs[0].metadata.version;
    var tfsxml = docs[0].data;
    var outputxml = docs[1];
    var diff = differ.diffLines(tfsxml, outputxml);
    //console.log(JSON.stringify(diff));
    var additions = readChunks(diff.filter(t => t.added));
    var deletions = readChunks(diff.filter(t => t.removed));

    return {
      version: tfsVersion,
      additions: additions,
      deletions: deletions
    };

  });
}

module.exports = {
  getCurrentDiff: getCurrentDiff
}
