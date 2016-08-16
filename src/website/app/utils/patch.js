'use strict';

var matchOpenDirectory = /<directory name="(.*)">/
var matchFile = /<file name="(.*)"\/>/;
var matchCloseDirectory = /<\/directory>/

function compareStrings(text1, text2) {
  return (text1 > text2) ? 1 : (text1 < text2) ? -1 : 0;
}

function compare(line1, line2) {
  var pathCompare = compareStrings(line1.path, line2.path);
  if (pathCompare == 0) {
    // order is opening directory tag, files, closing tag
    return line1.xml == "</directory>" ? 
  }
}

module.exports = function(file, additions, deletions) {
  var lines = file.split("\r\n");
  var parents = [];
  var ixAdd = 0;
  var ixDel = 0;
  for (line of lines) {
    var openDirectory = null;
    var file = null;
    var closeDirectory = null;
    
    openDirectory = line.match(matchOpenDirectory);
    if (openDirectory) {
      // push name of directory to stack
      parents.push(openDirectory[1]);
    } else {
      closeDirectory = line.match(matchCloseDirectory);
      if (!closeDirectory) {
        file = line.match(matchFile);
        if (!file) {
          throw new Error(`Unable to parse line ${line}`);
        }
      }
    }

    // maybe we should add lines before outputting this one?
    while ((ixAdd < additions.length) && additions[ixAdd])

  }
};