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
        log.trace(result, `get ${id} returned successfully.`);
        return result;
      });
    },
    getByName: function(name) {
      return db.view("build", "byName", {keys: [name]}).then(result => {
        var list = result.rows();
        log.trace(`getByName return ${list.length} items.`);
        if (result.length == 1) return result;
        return null;
      });
    },
    saveBuild: function(build) {
      log.trace(`saveBuild ${build._id} (${build.name})`);
      return db.insert(build).then(result => {
        log.trace(`saveBuild ${build._id} saved revision ${result.rev}.`);
        return result;
      });
    },
    updateTfsPath: function(id, newPath) {
      log.trace(`updateTfsPath ${id} ${newPath}`);
      return db.atomic("build", "cd-template-location", id, newPath).then(result => {
        var rev = result[1]["x-couch-update-newrev"];
        log.trace(`updateTfsPath ${id}; ${result}` + (rev && `; new rev ${rev}.` || "."));
        return result;
      });
    },
    follow: function(params, callback) {
      return db.follow(params || {}, callback);
    }
  };
}
