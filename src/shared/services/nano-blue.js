'use strict';

var bluebird = require('bluebird');
var nano = require('nano');
var _ = require('lodash');

var blacklist = ['use', 'scope', 'follow'];     // pdf: added follow to list

/**
 * Promisifies the exposed functions on an object
 * Based on a similar function in `qano`
 *
 * @see https://github.com/jclohmann/qano
 */
function deepPromisify(obj) {
  return _.transform(obj, function(promisifiedObj, value, key) {
    if (blacklist.indexOf(key) !== -1) {
      promisifiedObj[key] = value;
      return;
    }

    if (typeof value === 'function') {
      promisifiedObj[key] = bluebird.promisify(value, obj);
    } else if (typeof value === 'object') {
      promisifiedObj[key] = deepPromisify(value);
    } else {
      promisifiedObj[key] = value;
    }
  });
}

module.exports = function nanoblue() {
  var nanoP = deepPromisify(nano.apply(null, arguments));

  // replace nano's docModule calls with a promisified version
  if (nanoP.hasOwnProperty('use')) {
    var originalDocModule = nanoP.use;
    nanoP.use = nanoP.scope = nanoP.db.use = nanoP.db.scope = function() {
      return deepPromisify(originalDocModule.apply(null, arguments));
    };
  }

  return nanoP;
};
