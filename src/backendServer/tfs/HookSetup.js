'use strict';

var log = requireShared('Log')("tfs/HookSetup");

/*
    Need permissions for this to work..
    Not sure whether path globbing is ok, or I need one per file :|
*/

module.exports = function(tfs) {
    return tfs.addSubscription({
        publisherId: "tfs",
        eventType: "tfvc.checkin",
        consumerId: "webHooks",
        consumerActionId: "httpRequest",
        publisherInputs: {
            path: "$/Vista/*dtemplate.xml"
        },
        consumerInputs: {
            url: "http://akdevweb01:7778/tfs/change"
        }
    });
};
