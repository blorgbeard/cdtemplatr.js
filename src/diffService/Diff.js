'use strict';

var Promise = require('bluebird');

var matchOpenDirectory = /<directory name="(.*)">/
var matchCloseDirectory = /<\/directory>/

function parseXml(text) {
    let lines = text.split('\r\n').map(t => t.trim()).filter(t => t);
    // line 1 better be the root!
    if (!lines[0].match(matchOpenDirectory)) {
        throw new Error("malformed xml - bad root node!");
    }
    let root = {
        xml: lines[0],
        type: "directory",
        children: [],
        next: null
    };
    let stack = [];
    let parent = root;
    let previous = root;
    for (let line of lines.slice(1)) {
        if (!parent) {
            throw new Error("malformed xml - stack underflow!");
        }
        let node = {
            xml: line,
            type: line.match(matchOpenDirectory) ? "directory" : line.match(matchCloseDirectory) ? "directory-end" : "file",
            children: [],
            next: null
        };
        previous.next = node;
        previous = node;
        parent.children.push(node);
        if (line.match(matchCloseDirectory)) {
            node.directory = parent.xml.match(matchOpenDirectory)[1];   // record parent path on closing nodes            
            parent = stack.pop();               
        } else if (line.match(matchOpenDirectory)) {
            stack.push(parent);            
            parent = node;
        }
    }
    return root;
}

function compareStrings(text1, text2) {
  // we need to sort like the standard .Net string.Compare does on the build server
  var result = text1.localeCompare(text2, "en-US", { sensitivity: "accent", numeric: false });
  return result;
}

function compareSiblings(node1, node2) {
    // order by type: directory, file, directory-end
    if (node1.type !== node2.type) {
        if (node1.type === "directory") return -1;
        if (node1.type === "directory-end") return 1;
        // node1 is a file
        if (node2.type === "directory") return 1;
        return -1;   // node2 is a directory-end/
    }
    // types are the same, so order by path
    return compareStrings(node1.xml, node2.xml);
}

function dumpNode(list, node) {
    list.push({
        xml: node.xml,
        directory: node.directory
    });
    let next = node.next;
    for (let child of node.children) {
        next = dumpNode(list, child);
    }
    return next;
}

function xmlDiff(xml1, xml2) {
    let additions = [];
    let deletions = [];

    let node1 = xml1;
    let node2 = xml2;

    while (node1 !== null && node2 !== null) {
        let compare = compareSiblings(node1, node2);
        if (compare === 0) {
            // equal, so step both; output nothing
            node1 = node1.next;
            node2 = node2.next;
        } else if (compare < 0) {
            // different, and since node1 is first, and both files are sorted, it doesn't exist in xml2
            // therefore: it was deleted.
            // dump this node and its descendents to the list, and move on past it
            node1 = dumpNode(deletions, node1);            
        } else { // if (compare > 0)
            // different, and since node2 is first, and both files are sorted, it doesn't exist in xml1
            // therefore: it was added.
            // dump this node and its descendents to the list, and move on past it
            node2 = dumpNode(additions, node2);
        }
    }

    return {
        additions: additions,
        deletions: deletions
    };
}

module.exports = function(inputText1, inputText2) {
    var xml1 = parseXml(inputText1);
    var xml2 = parseXml(inputText2);
    var result = xmlDiff(xml1, xml2);
    return result;
}