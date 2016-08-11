'use strict';

var log = requireShared('Log')("repo/Build");

module.exports = function Build(db) {
  return {
    getNames: function() {
      return db.view('build', 'namesById').then(result => {
        var list = result.rows.map(t => ({_id: t.id, name: t.value.name, _rev: t.value._rev}));
        log.trace(`getNames returned ${list.length} items.`);
        return list;
      });
    },
    getAll: function() {
      return db.view('build', 'all').then(result => {
        var list = result.rows.map(t => t.value);
        log.trace(`getAll returned ${list.length} items.`);
        return list;
      });
    },
    get: function(id) {
      return db.get(id).then(result => {
        log.trace(`get ${id} returned revision ${result._rev}.`);
        return result;
      });
    },
    saveBuild: function(build) {
      log.trace(`saveBuild ${build._id} (${build.name})`);
      return db.insert(build).then(result => {
        log.trace(`saveBuild ${build._id} saved revision ${result.rev}.`);
        return result;
      });
    },    
    follow: function(params, callback) {
      return db.follow(params || {}, callback);
    }
  };
}
