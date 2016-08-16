'use strict';

function compareStrings(text1, text2) {
  return (text1 > text2) ? 1 : (text1 < text2) ? -1 : 0;
}

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

function parseLine(line, parent) {

  var matchOpenDirectory = /<directory name="(.*)">/
  var matchFile = /<file name="(.*)"\/>/;
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

function patch(file, additions, deletions) {
    var lines = file.split("\r\n");
    var output = [];
    var adds = additions.map(line => parseLine(line.xml, line.directory));
    var dels = deletions.map(line => parseLine(line.xml, line.directory));
    var parents = [null];
    var ixAdd = 0;
    var ixDel = 0;
    for (var xml of lines) {
      var line = parseLine(xml, parents[parents.length-1]);
      if (line.type === "directory") {
        parents.push(line.path);
      } else if (line.type === "directory-end") {
        parents.pop();
      }

      // should we add stuff before this line?
      while (ixAdd < adds.length) {
        let cmp = compare(adds[ixAdd], line);
        if (cmp < 0) {
          // yes, this line is supposed to be after the next to-add line
          // so add the to-add line first. 
          output.push(additions[ixAdd].xml);
          ixAdd++;
        } else if (cmp === 0) {
          // adding a line that already exists! just skip it (there can be no dupes in this file)
          ixAdd++;
        } else {
          // the next to-add line is after this line, so that's it for now
          break;
        }
      }
            
      // we have lines in mind for deletion
      // but have we actually gone past where any of them should be?
      // they may have been deleted already
      while ((ixDel < dels.length) && (compare(dels[ixDel], line) < 0)) {
        // yeah, we went past this one. skip it.
        ixDel++;
      }

      // ok, so the next delete-line is not behind us. did we hit it?
      if ((ixDel < dels.length) && (compare(dels[ixDel], line) === 0)) {
        // yes, we are currently on a to-be-deleted line. don't output it.
        ixDel++;        
      } else {
        // no, this line is not marked for deletion, so output it.
        output.push(xml);
      }
    }

    return output.join('\r\n');
  }

module.exports = {
  getCommonParentPath: getCommonParentPath,
  getParent: getParent,
  compare: compare,
  patch: patch
};