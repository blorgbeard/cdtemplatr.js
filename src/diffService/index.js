'use strict';

var log = requireShared("Log")("diffService");

var Promise = require('bluebird');

var config = requireShared('Config');
var diff = require('./diff.js');

var lastChangeProcessed_key = "diffService_lastSeqProcessed";

var defaultState = {
  _id: lastChangeProcessed_key,
  value: 0
}

requireShared("Domain")(config).then(db => {
  Promise.all([
    db.state.get(defaultState._id).then(result => result || defaultState),
    requireShared("Tfs")(config)
  ]).then(dependencies => {
    
    var lastChangeProcessed = dependencies[0].value;
    var tfs = dependencies[1];
    var controller = require('./Controller')(db, tfs, diff);
      
    var buildsInCatchupList = new Set();
    
    log.info(`Last sequence number processed is ${lastChangeProcessed}. Checking for subsequent changes.`);

    var feed = db.build.follow({
      since: lastChangeProcessed, 
      feed: "continuous", 
      include_docs: false // todo: would be more optimal to include them and pass them to the controller?
    });
    
    feed.on("change", change => {
      if (feed.caught_up) {
        // process single change
        log.debug(`Processing change sequence ${change.seq}.`)
        controller.ensure(change.id).then(result => {
          return db.state.bump(lastChangeProcessed_key, change.seq).then(()=>{
            log.debug(`Processed change sequence ${change.seq}.`)
          });
        });
      } else {
        // still catching up, add to set of IDs to process
        buildsInCatchupList.add(change.id);
      }
    });
    feed.on("error", error => { throw(error); });
    feed.on("catchup", seq_id => {
      log.info(`Found ${buildsInCatchupList.size} changes since sequence ${lastChangeProcessed}.`);
      if (buildsInCatchupList.size === 0) {
        log.info("Waiting for more changes.");
        return;
      }
      log.info("Processing backlog of changes.");
      Promise.all(Array.from(buildsInCatchupList).map(buildId => controller.ensure(buildId))).then(() => {
        return db.state.bump(lastChangeProcessed_key, seq_id).then(result => {
          log.info("Backlog processed. Waiting for more changes.");
          buildsInCatchupList = new Set();  // just.. in case.
        });        
      });      
    })
    feed.follow();
  });
});