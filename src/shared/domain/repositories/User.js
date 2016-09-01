'use strict';

var log = requireShared('Log')("repo/User");
var Promise = require('bluebird');

var User = requireShared('domain/model/User');

module.exports = function(db, ldapLookup) {
  return {
    get: function(id) {
      // todo: if cached more than 1 day ago, renew from ldap.
      return db.get(id).then(
        result => {
          log.trace(`get ${id} - retrieved "${result.displayName}" from cache.`);
          return result;
        },
        error => {
          return new Promise((resolve, reject) => {
            ldapLookup.search(id, (error, profile) => {            
              if (error) reject(error);
              var user = User(id, profile);
              db.insert(user).then(() => {
                log.trace(`get ${id} - retrieved "${user.displayName}" from ldap.`);
                resolve(user);
              });
            });
          });
        }
      );
    },
    put: function(doc) {
      return db.insert(doc);
    }
  };
};
