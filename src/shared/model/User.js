'use strict';

module.exports = function(username, ldapProfile) {
  return {
    _id: username,
    username: username,
    displayName: ldapProfile.displayName,
    thumbnailPhoto: ldapProfile.thumbnailPhoto.toString("base64"),
    email: ldapProfile.mail,
    title: ldapProfile.title,
    cached: new Date()
  };
};
