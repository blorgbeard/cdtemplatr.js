'use strict';

var log = requireShared("Log")("diffService");

var config = requireShared('Config');

requireShared("Database")(config).then(db => {
  var feed = db.build.follow({since: 1, feed: "continuous", include_docs:true});
  console.log(feed);
  feed.on("change", change => {
    console.log(change);
  });
  feed.on("error", error => { throw(error); });
  feed.on("catchup", seq_id => {
    console.log(`Caught up to ${seq_id}.`);
  })
  feed.follow();
});