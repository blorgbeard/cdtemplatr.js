'use strict';

var matchBuildFile = /(.+)_([0-9.]+)_(\d{8})\.(\d+)(_cdtemplate)?\.exe/;
var matchNameAndBranch = /^(.+)_([0-9]+\.[0-9]+\.[0-9]+)/;

function humanize(input) {
  var camelCaseToSpace = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g
  return (input
    .replace(camelCaseToSpace, '$1$4 $2$3$5')
    .replace(/_/g, ' ')
  );
}

function getTitleAndBranch(name, version) {
  let suffixes = {
    "_Dev": "Dev",
    "_Main": "Main",
    "_Priv": "Private"
  };
  var name = nameAndVersion[1];
  var version = nameAndVersion[2];
  for (var key in suffixes) {
    if (suffixes.hasOwnProperty(key)) {
      if (name.endsWith(key)) {
        var branch = suffixes[key];
        name = name.slice(0, -key.length);
        break;
      }
    }
  }
  if (!branch) {
    branch = version;
  }
  return {
    title: humanize(name),
    branch: branch
  };
}

module.exports = function(filename) {
  let match = filename.match(matchBuildFile);
  if (!match) throw new Error(`Unable to parse '${filename}' as a build output.`);

  var nameAndBranch = filename.match(matchNameAndBranch);
  var titleAndBranch = getTitleAndBranch(nameAndBranch[1], nameAndBranch[2]);

  var result = {
    title: titleAndBranch[1],
    branch: titleAndBranch[2],
    prefix: nameAndBranch[0],
    version: match[2],
    date: match[3],
    number: match[4],
    filename: filename,
    cdtemplate: match[5] ? filename.replace(/_cdtemplate.exe$/, "_cdtemplate.xml") : null
  }
  return result;
}
