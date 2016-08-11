'use strict';

/*
  see the model classes for the data-structure
*/

// todo: delete? not used?

function CreateDesignDoc(rev) {
  return {
    _id: "_design/outputCd",
    _rev: rev,
    language: "javascript",
    "updates": {
      "upsert": `function (doc, req) {
        if (!doc) {
          doc = {'_id': req.id};
        }
        doc.buildDefinitionId = req.form.buildDefinitionId;
        doc.buildId = req.form.buildId;
        doc.data = req.form.data;
        return [doc, 'value was set'];
      }`
    }
  };
}

module.exports = {
  database: "output_cd",
  design: CreateDesignDoc
};
