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

function getCurrentDiff(build) {
  return Promise.all([
    buildController.getTfsCdTemplate(build),
    buildController.getOutputCdTemplate(build)
  ]).then(docs => {
    var tfsVersion = docs[0].metadata.version;
    var tfsxml = docs[0].data;
    var outputxml = docs[1];
    if (tfsxml.length < 10) {
      console.log(`no file data received for ${build.cdtemplateLocation}`);
      return null;
    }
    if (outputxml.length < 10) {
      console.log(`no file data received for ${build.outputLocation}`);
      return null;
    }
    console.log(`performing diff for ${build.name} ${build.branch}`);
    var diff = differ.diffLines(tfsxml, outputxml);

    var additions = readChunks(diff.filter(t => t.added));
    var deletions = readChunks(diff.filter(t => t.removed));

    var summary = {
      total: readChunks(diff).length,
      additions: additions.length,
      deletions: deletions.length
    }

    console.log(JSON.stringify(summary));

    if (summary.total == summary.additions) {
      // something seems to have gone wrong with the diff
      // todo: sort it out properly
      return null;
    }

    // todo: probably should return more metadata:
    // * path to tfs xml file
    // * path to shared folder xml file
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
