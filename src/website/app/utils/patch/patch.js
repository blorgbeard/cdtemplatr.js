'use strict';

var parseLine = require('./parse').parseLine;
var compare = require('./compare').compare;

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
  patch: patch
};