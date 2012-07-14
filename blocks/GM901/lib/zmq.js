var zmq = require('zmq');
var xx = require('./xx');
var subSocket = zmq.socket('sub');
var pushSocket = zmq.socket('push');
var imei_last = {}; // imei -> last epoch data

// the only exported entry
exports.start = function(cs_pub, cs_pull, cs_filter) {
    subSocket.connect(cs_pub);
    subSocket.subscribe(cs_filter);
    console.log("%d - Starts to subscribe %s---- message from", Date.now(), cs_filter, cs_pub);
    pushSocket.connect(cs_pull);
    console.log("%d - Starts to push device events to %s", Date.now(), cs_pull);
};

subSocket.on('message', function(msg) {
    console.log('pub > %s', msg.toString());
});

xx.events.on('gm901', function(gm901) {

});
