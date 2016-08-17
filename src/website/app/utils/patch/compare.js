'use strict';

var getCommonParentPath = require('./path').getCommonParentPath;

function compareStrings(text1, text2) {
  return (text1 > text2) ? 1 : (text1 < text2) ? -1 : 0;
}

function compare(line1, line2) {

  // same path..
  if (line1.path === line2.path) {
    if (line1.type === line2.type) {
      // same type! identical.
      return 0;
    }

    // if only one is an end-directory, it's last
    if (line1.type === "directory-end") return 1;
    if (line2.type === "directory-end") return -1;

    // if they have the same path, and different types, and one isn't a directory-end,
    // then that is not valid.
    throw new Error("invalid paths.");

  }

  var commonParent = getCommonParentPath(line1.path, line2.path);

  var path1 = line1.path.slice(commonParent.length + 1) // +1 == remove the trailing \
  var path2 = line2.path.slice(commonParent.length + 1) // +1 == remove the trailing \

  // if one is a parent of the other, then the parent is first (unless it's a directory-end, in which case it's last)
  if (path1 === "") {
    return line1.type === "directory-end" ? 1 : -1;
  }
  if (path2 === "") {
    return line2.type === "directory-end" ? -1 : 1;
  }

  var isLeaf1 = (path1.indexOf('\\') === -1);
  var isLeaf2 = (path2.indexOf('\\') === -1);

  if (isLeaf1 && isLeaf2) {
    // if they are both leaves after removing the common parent path, 
    // then they are both in the same folder..
    // and the order is directories and directory-ends (by name), then files (by name)
    if (line1.type === line2.type) {
      return compareStrings(path1, path2);
    }
    // they aren't the same type.
    // a file is always last..
    if (line1.type === "file") return 1;
    if (line2.type === "file") return -1;
    // neither is a file, and they aren't the same, so one is a directory and one is an end.
    var cmp = compareStrings(path1, path2);
    if (cmp === 0) {
      // they are for the same directory - end goes last
      if (line1.type === "directory-end") return 1;
      return 0;
    }
    // they are for different directories, so we can just go by name.
    return cmp;
  }

  if (isLeaf1 && line1.type === "directory-end") return 1;
  if (isLeaf2 && line2.type === "directory-end") return -1;

  if (isLeaf1 && line1.type === "file") return 1;
  if (isLeaf2 && line2.type === "file") return -1;

  // neither are non-folder-leaves
  return compareStrings(path1, path2);
}

module.exports = {
  compareStrings: compareStrings,
  compare: compare
};