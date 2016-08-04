'use strict';

var log = require('../Log')("LdapLookup");
var ldap = require('ldapjs');

var LdapLookup = module.exports = function(options){
  this._options = options;

  this._search_query = options.search_query ||
    '(&(objectclass=user)(|(sAMAccountName={0})(UserPrincipalName={0})))';

  this._client = options.client ? options.client : ldap.createClient({
    url:             options.url,
    maxConnections:  options.maxConnections || 10,
    bindDN:          options.bindDN,
    bindCredentials: options.bindCredentials,
    tlsOptions:      options.tlsOptions,
    reconnect:       options.reconnect
  });

  this._client.on('error', function(e){
    log.error(e, 'LDAP connection error');
  });

  if (options.client) {
    this.clientConnected = true;
    return;
  }

  this._queue = [];
  var self = this;
  this._client.bind(options.bindDN, options.bindCredentials, function(err) {
    if (err) {
        return log.error(err, "Error binding to LDAP");
    }
    self.clientConnected = true;
    self._queue.forEach(function (cb) { cb(); });
  });
};

function getProperObject(entry) {
  var obj = {
    dn: entry.dn.toString(),
    controls: []
  };
  entry.attributes.forEach(function (a) {
    var buf = a.buffers;
    var val = a.vals;
    var item;
    if ( a.type == 'thumbnailPhoto' || a.type == 'userCertificate' )
      item = buf;
    else
      item = val;
    if (item && item.length) {
      if (item.length > 1) {
        obj[a.type] = item.slice();
      } else {
        obj[a.type] = item[0];
      }
    } else {
      obj[a.type] = [];
    }
  });
  entry.controls.forEach(function (element, index, array) {
    obj.controls.push(element.json);
  });
  return obj;
}

LdapLookup.prototype.search = function (username, callback) {
  var self = this;
  function exec(){
    var opts = {
      scope: 'sub',
      filter: self._search_query.replace(/\{0\}/ig, username)
    };
    self._client.search(self._options.base, opts, function(err, res){
      var entries = [];
      res.on('searchEntry', function(entry) {
        entries.push(getProperObject(entry));
      });
      res.on('error', function(err) {
        callback(err);
      });
      res.on('end', function() {
        if(entries.length === 0) return callback(null, null);
        callback(null, entries[0]);
      });
    });
  }

  if(this.clientConnected){
    exec();
  } else {
    this._queue.push(exec);
  }
};
