'use strict';

function parseLine(line, parent) {

  var matchOpenDirectory = /<directory name="(.*)">/
  var matchFile = /<file name="(.*)" ?\/>/;
  var matchCloseDirectory = /<\/directory>/

  var openDirectory = line.match(matchOpenDirectory);
  if (openDirectory) {
    return {
      type: "directory",
      path: openDirectory[1]
    };
  }

  var file = line.match(matchFile);
  if (file) {
    return {
      type: "file",
      path: file[1]
    };
  }

  var closeDirectory = line.match(matchCloseDirectory);
  if (closeDirectory) {
    return {
      type: "directory-end",
      path: parent
    };
  }

  throw Error(`Unable to parse line "${line}"`);

}

module.exports = {
  parseLine: parseLine
};