'use strict';

/*
  see the model classes for the data-structure
*/

module.exports = function (rev) {
  return {
    // todo: consider moving each view to its own design doc for optimization purposes
    _id: "_design/build",
    _rev: rev,
    language: "javascript",
    "updates": {
      "cd-template-location": `function (doc, req) {
        if (!doc) {
          // possible that we got a build before we found the definition
          doc = {_id: req.id};
        }
        if (!doc.tfs) {
          doc.tfs = {};
        }
        if (doc.tfs.location !== req.body) {
          doc.tfs.location = req.body;
          doc.tfs.revision = null;
          return [doc, 'value was set'];
        } else {
          return [null, 'value unchanged'];
        }
      }`
    },
    views: {
      "namesById": {
        "map": "function(doc) { emit(doc._id, {name: doc.name, _rev: doc._rev}); }",
        "filter": "function(doc) { return !!doc.id; }"                           // this excludes design docs. should probably add a "type" prop instead?
      },
      "all": {
        "map": "function(doc) { emit([doc.friendlyName, doc.branch], doc); }",
        "filter": "function(doc) { return !!doc.id; }"                           // this excludes design docs. should probably add a "type" prop instead?
      },
      "byName": {
        "map": "function(doc) { emit(doc.name, doc); }",
        "filter": "function(doc) { return !!doc.id; }"                           // this excludes design docs. should probably add a "type" prop instead?
      }
    }
  };
};
