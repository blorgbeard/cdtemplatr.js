'use strict';

/*
  see the model classes for the data-structure
*/

module.exports = function (rev) {
  return {
    _id: "_design/outputCd",
    _rev: rev,
    language: "javascript",
    "updates": {
      "upsert": `function (doc, req) {
        if (!doc) {
          doc = {'_id': req.id};
        }
        doc.form = req.form;
        doc.buildDefinitionId = req.form.buildDefinitionId;
        doc.buildId = req.form.buildId;
        doc.data = req.form.data;
        return [doc, 'value was set'];
      }`
    }
  };
};
