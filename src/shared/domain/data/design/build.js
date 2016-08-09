'use strict';

/*
  see the model classes for the data-structure
*/

function CreateDesignDoc(rev) {
  return {
    // todo: consider moving each view to its own design doc for optimization purposes
    _id: "_design/build",
    _rev: rev,
    language: "javascript",    
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
}

module.exports = {
  database: "build",
  design: CreateDesignDoc
};
