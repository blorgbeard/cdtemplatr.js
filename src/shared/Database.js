'use strict';

var log = require('./Log')("Database");
var Promise = require('bluebird');

var LdapLoookup = requireShared('services/LdapLookup');

function createDb(nano, database) {
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

function createDesign(db, designMaker) {
  if (!designMaker) {
    return Promise.resolve(true);
  }
  var rev = null;
  var newDesign = designMaker(undefined);
  return (
     db.get(newDesign._id).then(result => {
      var oldDesign = result[0];
      var updatedDesign = designMaker(oldDesign._rev);
      if (JSON.stringify(updatedDesign) !== JSON.stringify(result[0])) {
        log.debug("Updating existing design: " + updatedDesign._id);
        return db.insert(updatedDesign);
      }
      log.debug("Design has not changed: " + oldDesign._id);
      return Promise.resolve(true);
    }).catch(err => {
      // assume it didn't exist, insert new
      log.debug("Inserting new design: " + newDesign._id);
      return db.insert(newDesign);
    })
  );
}

module.exports = function(config) {
  log.debug("Connecting to couchdb: " + config.couchdb);
  var nano = require('nano-blue')(config.couchdb);

  var Build = requireShared('database/repositories/Build');
  var Diff = requireShared('database/repositories/Diff');
  var TfsCd = requireShared('database/repositories/TfsCd');
  var OutputCd = requireShared('database/repositories/OutputCd');
  var User = requireShared('database/repositories/User');

  var buildDesign = requireShared('database/design/build');
  var diffDesign = requireShared('database/design/diff');
  var tfsCdDesign = requireShared('database/design/tfsCd');
  var outputCdDesign = requireShared('database/design/outputCd');

  return Promise.all([
     createDb(nano, 'build').then(db => createDesign(db, buildDesign).then(() => db)),
     createDb(nano, 'diff').then(db => createDesign(db, diffDesign).then(() => db)),
     createDb(nano, 'tfs_cd').then(db => createDesign(db, tfsCdDesign).then(() => db)),
     createDb(nano, 'output_cd').then(db => createDesign(db, outputCdDesign).then(() => db)),
     createDb(nano, 'user').then(db => createDesign(db, null).then(() => db))
  ]).then(results => {
    return {
      build: Build(results[0]),
      diff: Diff(results[1]),
      tfsCd: TfsCd(results[2]),
      outputCd: OutputCd(results[3]),
      user: User(results[4], new LdapLoookup({
        url: config.ldap.url,
        base: config.ldap.base,
        bindDN: `${config.secret.windows.username}@${config.secret.windows.domain}`,
        bindCredentials: config.secret.windows.password
      }))
    };
  });
};
