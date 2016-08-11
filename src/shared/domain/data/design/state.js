'use strict';

/*
  see the model classes for the data-structure
*/

function CreateDesignDoc(rev) {
  return {
    _id: "_design/state",
    _rev: rev,
    language: "javascript",
    "updates": {
      "bump": `function (doc, req) {
        if (!doc) {
          doc = {'_id': req.id, value: 0};
        }
        if (req.body > doc.value) {
          doc.value = req.body;
          return [doc, 'bumped'];
        }
        return [null, null];
      }`
    }
  };
}

module.exports = {
  database: "state",
  design: CreateDesignDoc
};
