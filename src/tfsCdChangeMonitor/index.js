'use strict';

var config = requireShared('config');
var log = requireShared('Log')("tfsCdChangeMonitor");
log.info("Starting up..");

var Promise = require('bluebird');
var _ = require('lodash');

var Build = requireShared('model/Build');

var TfsService = requireShared('TfsService');
var Database = requireShared('Database');

var poll = function(db, tfs, interval) {
  log.info("Polling for updated cdtemplate.xml files in tfs..");
  db.build.getAll().then(builds => {
    builds = builds.filter(t => t.tfs && t.tfs.location);

    return Promise.all(
      builds.map(build => 
        tfs.getFileMetadata(build.tfs.location).then(
          metadata => {
            if (!build.tfs.revision || (build.tfs.revision < metadata.version)) {
              log.info(`Updating cdtemplate for build ${build._id} (${build.name}) from ${build.tfs.revision} to ${metadata.version}.`);
              build.tfs.revision = metadata.version;
              return db.build.saveBuild(build);
            }
          },
          error => {
            log.error(error, `Error when polling build ${build._id}`);
          }
        )
      )
    );
  }).then(() => {
    log.debug(`Waiting ${interval / 1000} seconds..`);
    setTimeout(() => poll(db, tfs, interval), interval);
  });
};

Database(config).then(db => {
  log.debug("Connected to couchdb.");
  TfsService(config).then(tfs => {
    log.debug("Connected to tfs.");
    poll(db, tfs, 1000 * 60 * 1);
  });
});
