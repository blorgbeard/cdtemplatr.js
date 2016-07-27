'use strict';

try {
  var config = require('./config/config.js');
  module.exports = config;
}
catch (err) {
  throw Error(`Config file not found: "src/shared/config/config.js". Please copy the example and fill out the fields.`);
}
