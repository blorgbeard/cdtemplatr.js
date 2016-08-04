'use strict';

var log = requireShared('Log')("repo/User");
var Promise = require('bluebird');

var User = requireShared('model/User');

module.exports = function(db, ldapLookup) {
  return {
    get: function(id) {
      // todo: if cached more than 1 day ago, renew from ldap.
      return db.get(id).then(
        result => result,
        error => {
          return new Promise((resolve, reject) => {
            ldapLookup.search(id, (error, profile) => {            
              if (error) reject(error);
              var user = User(id, profile);
              db.insert(user).then(() => {
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
