'use strict';

var Promise = require('bluebird');
var jsdiff = require('diff');

var matchOpenDirectory = /<directory name="(.*)">/
var matchCloseDirectory = /<\/directory>/

module.exports = function(inputText1, inputText2) {
    var result = jsdiff.diffLines(inputText1, inputText2);
    var additions = [];
    var deletions = [];
    var parents = [];
    for (var chunk of result) {
        for (var line of chunk.value.split('\r\n').map(t => t.trim()).filter(t => t)) {            
            var openDirectory = null;
            var closeDirectory = null;
            
            openDirectory = line.match(matchOpenDirectory);
            if (openDirectory) {
                // push name of directory to stack
                parents.push(openDirectory[1]);
            } else {
                closeDirectory = line.match(matchCloseDirectory);
            }

            if (chunk.added || chunk.removed) {
                var diffLine = {
                    xml: line
                };
                if (closeDirectory) {
                    // record the path that this closing tag matches
                    var parent = parents[parents.length-1];
                    diffLine.directory = parent;
                }

                if (chunk.added) {
                    additions.push(diffLine);            
                } else {
                    deletions.push(diffLine);
                }
            }

            if (closeDirectory) {
                parents.pop();
            }
        }
    }
    // todo: some filtering of changes. see diff ps1 script.

    return {
        additions: additions,
        deletions: deletions
    };
}