/*
  Copy this file and name it config.js
  then fill out the fields appropriately.
*/

module.exports = {
  "tfs": {
    "protocol": "http",
    "server": "localhost",
    "port": 8080,
    "root": "tfs",
    "collection": "DefaultCollection",
    "project": "ExampleProject",
    // certificate is optional, may be required for https and self-signed cert.
    "ca": "CompanyRootCertificate.cer"
  },

  "couchdb": "http://localhost:5984",

  // options: trace, debug, info, warn, error, fatal, silent
  "loglevel": "trace",

  "backendServer": {
    "port": 7778
  },

  "website": {
    "protocol": "https",
    "port": 443,
    "title": "cdtemplatr.js"
  }
}
