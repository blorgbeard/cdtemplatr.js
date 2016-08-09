'use strict';

var Promise = require('bluebird');
var jsdiff = require('diff');

module.exports = function(inputText1, inputText2) {
    var result = jsdiff.diffLines(inputText1, inputText2);
    var additions = [];
    var deletions = [];
    for (var chunk of result) {
        if (chunk.added) {
            for (var line of chunk.value.split('\r\n').filter(t => t.trim() !== "")) {
                additions.push(line.trim());
            }
        } else if (chunk.removed) {
            for (var line of chunk.value.split('\r\n').filter(t => t.trim() !== "")) {
                deletions.push(line.trim());
            }
        }
    }
    // todo: some filtering of changes. see diff ps1 script.

    return {
        additions: additions,
        deletions: deletions
    };
}