'use strict';

function getParent(path) {
  if (!path) return null;
  return path.slice(0, path.lastIndexOf('\\'));
}

function getCommonParentPath(path1, path2) {
  var result = "";
  var splut1 = path1.split('\\');
  var splut2 = path2.split('\\');
  var ix = 1; // skip the initial empty string
  while (ix < splut1.length && ix < splut2.length && splut1[ix] === splut2[ix]) {
    result += '\\' + splut1[ix];
    ix++;
  }
  return result;
}

module.exports = {
  getParent: getParent,
  getCommonParentPath: getCommonParentPath
};