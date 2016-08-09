'use strict';

var log = requireShared('Log')(require('path').basename(__filename));
var Promise = require('bluebird');
var _ = require('lodash');

var LdapLoookup = requireShared('domain/data/LdapLookup');

function createDb(nano, database) {
  return nano.db.create(database).then(() => {
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
     db.get(newDesign._id).then(oldDesign => {
      var updatedDesign = designMaker(oldDesign._rev);
      if (JSON.stringify(updatedDesign) !== JSON.stringify(oldDesign)) {
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
  var nano = requireShared('domain/data/nano-blue')(config.couchdb);

  // repository classes
  var Build = requireShared('domain/repositories/Build');
  var Diff = requireShared('domain/repositories/Diff');
  var OutputCd = requireShared('domain/repositories/OutputCd');
  var User = requireShared('domain/repositories/User');
  var State = requireShared('domain/repositories/State');

  var designs = [
    requireShared('domain/data/design/build'),
    requireShared('domain/data/design/outputCd')
  ];

  var databaseNames = ['build', 'output_cd', 'diff', 'user', 'state'];
  return Promise.all(databaseNames.map(name => createDb(nano, name).then(db => [name, db]))).then(databases => {
    
    // convert from nested array to keyed object:
    databases = _.transform(databases, (obj, val) => { obj[val[0]] = val[1]; }, {});
    
    // create/update all designs
    return Promise.all(designs.map(design => 
      createDesign(databases[design.database], design.design)
    )).then(() => {
      // create Domain object that holds the repositories
      return {
        build: Build(databases["build"]),
        diff: Diff(databases["diff"]),
        outputCd: OutputCd(databases["output_cd"]),
        // todo: this fails when ldap not available
        // so, can't access builds when unable to create new users..
        // seems not SOLID.. 
        user: User(databases["user"], new LdapLoookup({
          url: config.ldap.url,
          base: config.ldap.base,
          bindDN: `${config.secret.windows.username}@${config.secret.windows.domain}`,
          bindCredentials: config.secret.windows.password
        })),
        state: State(databases["state"]) 
      };
    });
  });
}
