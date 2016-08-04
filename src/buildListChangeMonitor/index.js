'use strict';

var config = requireShared('config');
var log = requireShared('Log')("buildListChangeMonitor");
log.info("Starting up..");

var Promise = require('bluebird');
var _ = require('lodash');

var Build = requireShared('model/Build');
var buildNameParser = require('./services/BuildNameParser')();

var TfsService = requireShared('TfsService');
var Database = requireShared('Database');

var poll = function(db, tfs, interval) {
  log.info("Polling for new builds..");
  Promise.all([
    db.build.getNames(),
    tfs.getBuildDefinitions()
  ]).then(results => {
    var dbList = results[0];
    var tfsList = results[1];

    var joined = (
      tfsList
      .map(t => ({
        tfs: t,
        db: dbList.filter(d => d._id == t.id),
        parsed: buildNameParser.parse(t.name)
      }))
      .filter(t =>
        !(t.parsed.prefix) &&                                   // for now, exclude all prefixed builds
        ((t.db.length === 0) || (t.db[0].name !== t.tfs.name))  // include new (in tfs) or renamed (in tfs) builds
       )
    );

    var newBuilds = joined.map(t => {
      var build = t.db && t.db[0] || Build("" + t.tfs.id);
      build.id = t.tfs.id;
      build.name = t.tfs.name;
      build.friendlyName = t.parsed.name;
      build.branch = t.parsed.branch;
      return build;
    });

    log.info(`Found ${newBuilds.length} new/changed builds.`);

    if (newBuilds.length > 0) {
      return Promise.all(
        newBuilds.map(t => db.build.saveBuild(t))
      ).then(() => log.info(`Saved ${newBuilds.length} builds.`));
    }

  }).then(() => {
    log.debug(`Waiting ${interval / 1000} seconds..`);
    setTimeout(() => poll(db, tfs, interval), interval);
  });
};

Database(config).then(db => {
  log.debug("Connected to couchdb.");
  TfsService(config).then(tfs => {
    log.debug("Connected to tfs.");
    poll(db, tfs, 1000 * 60 * 30);
  });
});
