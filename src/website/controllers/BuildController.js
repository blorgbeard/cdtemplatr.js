'use strict';

var Promise = require('bluebird');

var log = requireShared('Log')("BuildsController");

var waitForRevision = function(domain, buildId, revision) {
  return new Promise(function(resolve, reject) {
    let feed = domain.build.follow({
      since: "now", 
      feed: "continuous", 
      include_docs: true
    });

    // wait for a change to the given build which puts 
    // the diff at or past the revision we're waiting for
    feed.filter = function(doc, req) { 
      return (
        doc.id == buildId && 
        doc.diff.tfs.revision >= revision
      ); 
    };

    feed.on("change", change => {
      feed.stop();
      resolve(change.doc);        
    });

    feed.follow();
  });
} 

module.exports = function(domain) {
  return {
    all: function() {
      return domain.build.getAll();
    },
    get: function(id) {
      return Promise.all([
        domain.build.get(id),
        domain.diff.get(id)
      ]).spread((build, diff) => {
        return {
          build: build,
          diff: diff
        };
      });
    },
    commit: function(id, details) {
      log.trace(JSON.stringify(details));
      return domain.build.get(id).then(build => {
        if (build.diff.tfs.revision <= details.changesetId) {
          log.trace(`triggering a diff for changeset ${details.changesetId}`);

          if (build.latest.tfs.revision < details.changesetId) {
            build.latest.tfs.revision = details.changesetId;
          }

          // force a rediff
          build.diff.tfs.revision = 0;

          var waitForDiff = waitForRevision(domain, id, details.changesetId);
          var saveBuild = domain.build.saveBuild(build);

          return Promise.all([waitForDiff, saveBuild]).then(result => this.get(id));
          
        } else {
          // nothing to commit, the database is already ahead
          log.warn(`Client committed revision ${details.changesetId} but diff is already at ${build.diff.tfs.revision}.`)
          return this.get(id);
        }
      });
    }
  };  
};
