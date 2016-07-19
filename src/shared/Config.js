'use strict';

module.exports = function() {
  try {
    var config = require('./config/config.json');
    return config;
  }
  catch (err) {
    throw Error(`Config file not found: "src/shared/config/config.json". Please copy the template and fill out the fields.`);
  }
}
