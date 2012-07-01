var xx = require("./xx"),
    md5 = require('./md5').md5,
    config = require('../config').config;

var gt02aHeartBeat = new Buffer('54681a0d0a', 'hex');
var lonlatUnit = 1/(500*3600); // degree
var deviceKey = {}; // {imei: md5(imei)}

exports.onConnect = function(socket) {
    // configure client
    socket.setNoDelay(true);
    socket.setTimeout(config.tcp_timeout*1000);
    socket.setKeepAlive(true, config.tcp_keepalive*1000);
};

exports.onEnd = function(socket) {
};

exports.onClose = function(socket, err) {
    if (err) {
        console.log("%d - TCP client error: %j", Date.now(), err);
    }
};

exports.onError = function(socket, err) {
    console.log('%d - TCP client error: %j', Date.now(), err);
};

exports.onTimeout = function(socket) {
    socket.end();
};

exports.onData = function(socket, data) {
    var len = data.length;
    if (len < 18) {
        console.log("%d - Abort: %s", Date.now(), data.toString('hex'));
        return;
    }
    
    var hIdx = 0; // frame head index
    var fLen = 0; // frame length
    var gt02a = null; // decoded data object
    while (hIdx < len) {
        if (data[hIdx] !== 0x68 || data[hIdx+1] !== 0x68) {
            hIdx += 1;
            continue;
        }
        
        fLen = data[hIdx+2] + 5;
        if (hIdx+fLen > len || data[hIdx+fLen-2] !== 0x0d || data[hIdx+fLen-1] !== 0x0a ) {
            hIdx += 1;
            continue;
        }
        
        // decode frame
        if (hIdx === 0 && fLen === len) { // single frame
            gt02a = decodeFrame(data, fLen);
        } else { // multiple frame
            gt02a = decodeFrame(data.slice(hIdx, hIdx+fLen), fLen);
        }
      
        // emit data
        if (gt02a.valid) {
            if (gt02a.protocol === 0x1a) { // heartbeat feedback
                socket.write(gt02aHeartBeat);
            }
            // calculate device key
            if (!deviceKey[gt02a.imei]) {
                deviceKey[gt02a.imei] = md5(gt02a.imei);
            }
            gt02a.key = deviceKey[gt02a.imei];
            // emit event
            xx.events.emit('gt02a', gt02a);
        }
        
        // try next frame
        hIdx += fLen;
    }
};

// decode raw frame to data object
function decodeFrame(frame, len) {
    var result = {};
    
    result.power    = frame.readUInt8(3) % 7;
    result.gsm      = frame.readUInt8(4) % 5;
    result.imei     = frame.toString('hex', 5, 13).slice(1);
    result.count    = frame.readUInt16BE(13);
    result.protocol = frame.readUInt8(15);
    
    var dt;
    if (result.protocol === 0x10 && len === 42) { // PVT
        dt = new Date(
            frame.readUInt8(16) + 2000,
            frame.readUInt8(17) - 1,
            frame.readUInt8(18),
            frame.readUInt8(19),
            frame.readUInt8(20),
            frame.readUInt8(21)
        );
        // CST -> UTC
        result.time = dt.getTime() + dt.getTimezoneOffset()*60000 - 28800000; // ms
        result.latitude     = frame.readUInt32BE(22) * lonlatUnit; // deg
        result.longitude    = frame.readUInt32BE(26) * lonlatUnit; // deg
        result.velocity     = frame.readUInt8(30);      // km/h
        result.course       = frame.readUInt16BE(31);   // deg
        result.reserved     = frame.toString('hex', 33, 36);
        result.stgps        = frame[39] & 0x01 ? 1 : 0;
        result.latitude     = frame[39] & 0x01 ? result.latitude : -1 * result.latitude;
        result.longitude    = frame[39] & 0x04 ? result.longitude : -1 * result.longitude;
        result.stpow        = frame[39] & 0x08 ? 1 : 0;
        result.stsos        = frame[39] & 0x10 ? 1 : 0;
        result.stoff        = frame[39] & 0x20 ? 1 : 0;
        // fix lonlat value
        result.longitude    = limitFixDigs(result.longitude, 6);
        result.latitude     = limitFixDigs(result.latitude, 6);
        // validate frame
        result.valid        = true;
    } else if (result.protocol === 0x1a) { // status & heartbeat
        dt = new Date();
        result.time = dt.getTime() + dt.getTimezoneOffset()*60000; // UTC
        result.gps          = frame.readUInt8(16) % 3;
        result.satenum      = frame.readUInt8(17) % 13;
        result.valid        = true;
    } else { // unknown frame type
        result.valid = false;
    }
    
    if (!result.valid) {
        console.log("%d - Abort: %s", Date.now(), frame.toString('hex'));
    }
    
    return result;
}

function limitFixDigs(num, fix) {
    var fig = 0;
    if (typeof fix === 'number') {
        fig = parseFloat(num.toFixed(fix));
    }
    return fig;
}
