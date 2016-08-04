'use strict';

try {
  var config = require('./config/config.js');
  try {
    var secret = require('./config/secret.js');
    config.secret = secret;
  } catch (err) {
    config.secret = {};
  }
  module.exports = config;
}
catch (err) {
  console.error(`Config file not found: "src/shared/config/config.js". Please copy the example and fill out the fields.`);
  throw err;
}
