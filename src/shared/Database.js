'use strict';

var log = require('./Log')("Database");

function Builds(db) {
  return {
    getNames: function() {
      return db.view('builds', 'names').then(result => {
        var list = result[0].rows.map(t => ({_id: t.id, name: t.value.name, _rev: t.value._rev}));
        log.trace(`getNames returned ${list.length} items.`);
        return list;
      });
    },
    getAll: function() {
      return db.view('builds', 'all').then(result => {
        var list = result[0].rows.map(t => t.value);
        log.trace(`getAll returned ${list.length} items.`);
        return list;
      });
    },
    get: function(id) {
      return db.get(id).then(result => {
        result = result[0];
        log.trace(result, `get ${id} returned successfully.`);
        return result;
      });
    },
    saveBuild: function(build) {
      log.trace(`saveBuild ${build._id} (${build.name})`);
      return db.insert(build).then(result => {
        log.trace(`saveBuild ${build._id} saved revision ${result[0].rev}.`);
        return result[0];
      });
    }
  };
}

module.exports = function(config) {
  log.debug("Connecting to couchdb: " + config.couchdb);
  var nano = require('nano-blue')(config.couchdb);

  function createDb(database) {
    return nano.db.create(database).then(()=>{
      log.debug("Created database: " + database);
      return Promise.resolve(nano.db.use(database));
    }).catch(err => {
      // ignore already exists
      if (err.error !== "file_exists")
        throw err;
      log.debug("Database exists: " + database);
      return Promise.resolve(nano.db.use(database));
    });
  }

  function makeDesignDoc(rev) {
    return {
      _id: "_design/builds",
      _rev: rev,
      language: "javascript",
      views: {
        "names": {
          "map": "function(doc) { emit(doc._id, {name: doc.name, _rev: doc._rev}); }"
        },
        "all": {
          "map": "function(doc) { emit([doc.friendlyName, doc.branch], doc); }",
          "filter": "function(doc) { return !(doc._id.startsWith('_')); }"      // this excludes design docs. should probably add a "type" prop instead.
        }
      }
    };
  }

  function createDesign(db, designMaker) {
    var rev = null;
    var newDesign = designMaker(undefined);
    return (
       db.get(newDesign._id)
      .then(result => {
        var oldDesign = result[0];
        var updatedDesign = designMaker(oldDesign._rev);
        if (JSON.stringify(updatedDesign) !== JSON.stringify(result[0])) {
          log.debug("Updating existing design: " + updatedDesign._id);
          return db.insert(updatedDesign);
        }
        log.debug("Design has not changed: " + oldDesign._id);
        return Promise.resolve(true);
      })
      .catch(err => {
        // assume it didn't exist, insert new
        log.debug("Inserting new design: " + newDesign._id);
        return db.insert(newDesign);
      })
    );
  }

  return (
     createDb('builds')
    .then(db =>
        createDesign(db, makeDesignDoc)
       .then(() => Builds(db))
    )
  );
};
