'use strict';

var log = requireShared("Log")("diffService");

var Promise = require('bluebird');

var config = requireShared('Config');
var diff = require('./diff.js');

var defaultState = {
  _id: "diffService_state",
  lastChangeProcessed: 0
}

requireShared("Domain")(config).then(db => {
  Promise.all([
    db.state.get(defaultState._id).then(result => result || defaultState),
    requireShared("Tfs")(config)
  ]).then(dependencies => {
    
    var state = dependencies[0];
    var tfs = dependencies[1];
    var controller = require('./Controller')(db, tfs, diff);
      
    var buildsInCatchupList = new Set();
    
    log.info(`Last sequence number processed is ${state.lastChangeProcessed}. Checking for subsequent changes.`);

    var feed = db.build.follow({
      since: state.lastChangeProcessed, 
      feed: "continuous", 
      include_docs: false // todo: would be more optimal to include them and pass them to the controller?
    });
    
    feed.on("change", change => {
      if (feed.caught_up) {
        // process single change
        log.debug(`Processing change sequence ${change.seq}.`)
        controller.ensure(change.id).then(result => {
          state.lastChangeProcessed = change.seq;
          return db.state.put(state);
        });
      } else {
        // still catching up, add to set of IDs to process
        buildsInCatchupList.add(change.id);
      }
    });
    feed.on("error", error => { throw(error); });
    feed.on("catchup", seq_id => {
      log.info(`Found ${buildsInCatchupList.size} changes since sequence ${state.lastChangeProcessed}.`);
      if (buildsInCatchupList.size === 0) {
        log.info("Waiting for more changes.");
        return;
      }
      log.info("Processing backlog of changes.");
      Promise.all(Array.from(buildsInCatchupList).map(buildId => controller.ensure(buildId))).then(() => {
        state.lastChangeProcessed = seq_id;
        db.state.put(state).then(()=> {
          log.info("Backlog processed. Waiting for more changes.");
          buildsInCatchupList = new Set();  // just.. in case.
        });        
      });      
    })
    feed.follow();
  });
});