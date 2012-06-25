var md5 = require('./md5').md5,
    events = require("./xx").events,
    config = require('../config').config;
var clients = {};

exports.onConnect = function(socket) {
    // configure client
    socket.setNoDelay(true);
    socket.setTimeout(config.tcp_timeout*1000);
    socket.setKeepAlive(true, config.tcp_keepalive*1000);
}

exports.onEnd = function(socket) {
    // device_key = md5(imei)
    if (socket.device_key) {
        delete clients[socket.device_key];
        delete socket.device_key;
    }
}

exports.onClose = function(socket, err) {
    if (err) {
        console.log("%d - TCP client error: %j", Date.now(), err);
    }
    
    if (socket.device_key) {
        delete clients[socket.device_key];
        delete socket.device_key;
    }
}

exports.onError = function(socket, err) {
    console.log('%d - TCP client error: %j', Date.now(), err);
}

exports.onTimeout = function(socket) {
    socket.end();
}

exports.onData = function(socket, data) {
    // forwording
    console.log("%s > %s", socket.tid, data.toString('hex'));
}
