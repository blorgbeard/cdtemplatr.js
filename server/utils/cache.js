'use strict'

var Promise = require('bluebird');
Promise.config({longStackTraces: true});
var fs = require('fs');
var writeFile = Promise.promisify(fs.writeFile);
var readFile = Promise.promisify(fs.readFile);
var readdir =  Promise.promisify(fs.readdir);

var path = __dirname + '/../cache/';
var cachedValues = new Map()

try {
  var result = restoreSync();
  console.log("loaded cached files: " + result.map(t=>t[0]).join(", "));
  cachedValues = new Map(result);
}
catch (error) {
  console.log("failed to load cached files: " + error.toString());
}

function restoreSync() {
  var files = fs.readdirSync(path);
  var matches = files.map(t => t.match(/(.+)\.json/)).filter(t=>t);
  var result = matches.map(m => {
    var filename = path + m[0];
    var key = m[1];
    var json = fs.readFileSync(filename);
    var parsed = JSON.parse(json);
    return [key, parsed];
  });
  return result;
}

function getValue(key, defaultValue) {
  if (cachedValues.has(key)) {
    return cachedValues.get(key);
  }
  if (defaultValue) {
    cachedValues.set(key, defaultValue);
  }
  return defaultValue;
}

function setValue(key) {
  return Promise.resolve(cachedValues.set(key, value));
}

function persist() {
  var promises = [];
  cachedValues.forEach(kvp => {
    var filename = `${path}${kvp[0]}.json`;
    var json = JSON.stringify(kvp[1], null, 4);
    promises.push(writeFile(filename, json, {flag: 'w'}));
  });
  return Promise.all(promises);
}

function clear(key) {
  return Promise.resolve(cachedValues.delete(key));
}

module.exports = {
  get: getValue,
  set: setValue,
  persist: persist,
  clear: clear
}
