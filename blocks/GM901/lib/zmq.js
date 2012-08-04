var zmq = require('zmq');
var xx = require('./xx');
var db = require('./db');
var subSocket = zmq.socket('sub');
var pushSocket = zmq.socket('push');
var key_last = {}; // key -> last epoch data
var key_push = {}; // key -> true/false

var message_filter = '';

// the only exported entry
exports.start = function(cs_pub, cs_pull, cs_filter) {
    subSocket.connect(cs_pub);
    subSocket.subscribe(cs_filter);
    console.log("%d - Starts to subscribe %s message from", Date.now(), cs_filter, cs_pub);
    pushSocket.connect(cs_pull);
    console.log("%d - Starts to push device events to %s", Date.now(), cs_pull);
    // save a copy
    message_filter = cs_filter;
};

subSocket.on('message', function(msg) {
    // buffer -> string
    msg = msg.toString('utf8');
    console.log('pub > %s', msg);
    // remove message head of filter
    msg = msg.slice(message_filter.length);
    console.log('pub > %s', msg);
    // parse JSON string to object
    msg = JSON.parse(msg);
    console.log('pub > %s', msg);
    
    if (msg && msg.key) {
        // realtime data
        if (msg.rt === 1) {
            key_push[msg.key] = true;
            var last = key_last[msg.key];
            if (last) {
                pushSocket.send(new Buffer(JSON.stringify(last), 'utf8'));
            }
        } else if (msg.rt === 0) {
            key_push[msg.key] = false;
        }
        // command
        if (msg.cmd === 1) {
            xx.events.emit('command', {key: msg.key, mark: msg.mark, command: msg.command});
        }
        // history data
        if (msg.ht === 1) {
            // query data from db and send back
        }
    }
});

xx.events.on('gm901', function(gm901) {
    // push to remote server
    if (key_push[gm901.key]) {
        pushSocket.send(new Buffer(JSON.stringify(gm901), 'utf8'));
    }
    
    // update local copy
    var last = key_last[gm901.key];
    if (!last) {
        last = {};
        key_last[gm901.key] = last;
    }
    
    extend(last, gm901);
});

/**
* APIFunction: extend
* Copy all properties of a source object to a destination object. Modifies
* the passed in destination object.  Any properties on the source object
* that are set to undefined will not be (re)set on the destination object.
*
* Parameters:
* destination - {Object} The object that will be modified
* source - {Object} The object with properties to be set on the destination
*
* Returns:
* {Object} The destination object.
*/
function extend(destination, source) {
    destination = destination || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if (value !== undefined) {
                destination[property] = value;
            }
        }
    }
    return destination;
}
