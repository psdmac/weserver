var net = require('net');
var xx = require('./xx');
var md5 = require('./md5').md5;
var crc = require('./crc').crc16;

var tcp = net.createServer();
var tcp_client_timeout, tcp_client_keepalive;

// only exported entry
exports.start = function(port, timeout, keepalive) {
    tcp.listen(port);
    
    tcp_client_timeout = timeout || 600;    // seconds
    tcp_client_keepalive = keepalive || 60; // seconds
    tcp_client_timeout = tcp_client_timeout*1000;       // ms
    tcp_client_keepalive = tcp_client_keepalive*1000;   // ms
};

tcp.on('listening', function() {
    console.log("%d - Listening port %d for TCP service", Date.now(), tcp.address().port);
});

tcp.on('error', function(error) {
    console.log("%d - TCP error: %j", Date.now(), error);
    process.exit(-1);
});

tcp.on('connection', function(socket) {
    var socketRemoteAddress = socket.remoteAddress + ':' + socket.remotePort;
    console.log("%d - [%s] connect, total: %d", Date.now(), socketRemoteAddress, tcp.connections);
    
    // configure client
    socket.setNoDelay(true);
    socket.setTimeout(tcp_client_timeout);
    socket.setKeepAlive(true, tcp_client_keepalive);
    
    socket.on('error', function(error) {
        console.log("%d - [%s] error: %j", Date.now(), socketRemoteAddress, error);
    });
    
    socket.on('end', function() {
        console.log("%d - [%s] end, total: %d", Date.now(), socketRemoteAddress, tcp.connections);
    });
    
    socket.on('close', function(had_error) {
        console.log("%d - [%s] close, error: %j,  total: %d", Date.now(), socketRemoteAddress, had_error, tcp.connections);
    });
    
    socket.on('timeout', function() {
        console.log("%d - [%s] timeout", Date.now(), socketRemoteAddress);
    });
    
    socket.on('data', function(data) {
        var len = data.length;
        if (len < 10) {
            console.log("%d - X-DATA, Abort: %s", Date.now(), data.toString('hex'));
            return;
        }
    
        var hIdx = 0; // frame head index
        var fLen = 0; // frame length
        var receivedCRC = 0x0000, calculatedCRC = 0xffff;
        var type, fsn; // frame serial number
        var gm901 = null; // decoded data object
        while (hIdx < (len-10)) {
            // check frame head
            if (data[hIdx] !== 0x78 || data[hIdx+1] !== 0x78) {
                console.log("%d - X-HEAD, Abort: %s", Date.now(), data.slice(hIdx, hIdx+1).toString('hex'));
                hIdx += 1;
                continue;
            }
            
            // check frame tail
            fLen = data.readUInt8(hIdx+2) + 5;
            if (hIdx+fLen > len || data[hIdx+fLen-2] !== 0x0d || data[hIdx+fLen-1] !== 0x0a ) {
                console.log("%d - X-FLEN, Abort: %s", Date.now(), data.slice(hIdx, hIdx+1).toString('hex'));
                hIdx += 1;
                continue;
            }
            
            // check frame CRC
            receivedCRC = data.readUInt16BE(hIdx+fLen-4);
            calculatedCRC = crc(data.slice(hIdx+2, hIdx+fLen-4));
            if (receivedCRC !== calculatedCRC) {
                console.log("%d - X-FCRC, Abort: %s", Date.now(), data.slice(hIdx, hIdx+fLen).toString('hex'));
                hIdx += fLen;
                continue;
            }
        
            // this is a valid frame
            type = data.readUInt8(hIdx+3);
            fsn = data.readUInt16BE(hIdx+fLen-6);
            
            // decode frame
            if (hIdx === 0 && fLen === len) { // single frame
                gm901 = decodeFrame(type, data);
            } else { // one of multiple frame
                gm901 = decodeFrame(type, data.slice(hIdx, hIdx+fLen));
            }
      
            if (!gm901 || !gm901.valid) {
                console.log("%d - Abort: %j", Date.now(), gm901);
                hIdx += fLen;
                continue;
            }
            
            // check registration
            if (type === 0x01) {
                gm901.key = md5(gm901.imei);
                setIMEI(socketRemoteAddress, gm901.imei);
                setIMEIByKey(gm901.key, gm901.imei);
                setKey(gm901.imei, gm901.key);
                setSocket(gm901.imei, socket);
            } else {
                gm901.imei = getIMEI(socketRemoteAddress);
                if (!gm901.imei) {
                    // forbidden access
                    socket.end();
                    return;
                }
                gm901.key = getKey(gm901.imei);
            }
            
            // feedback
            if (type === 0x01 || type === 0x13 || type === 0x16) {
                socket.write(getFeedback(type, fsn));
            }
            
            // emit event with this epoch data
            xx.events.emit('gm901', gm901);
        
            // try next frame
            hIdx += fLen;
        }
    });
});

var addr_imei = {}; // map of addr -> imei
var imei_sock = {}; // map of imei -> socket
var imei_dkey = {}; // map of imei -> device key
var dkey_imei = {}; // map of dkey -> imei

function setIMEI(addr, imei) {
    if (addr) {
        addr_imei[addr] = imei;
    }
}

function getIMEI(addr) {
    if (addr) {
        return addr_imei[addr];
    }
    return null;
}

function setSocket(imei, socket) {
    if (imei) {
        imei_sock[imei] = socket;
    }
}

function getSocket(imei) {
    if (imei) {
        return imei_sock[imei];
    }
    return null;
}

function setKey(imei, key) {
    if (imei) {
        imei_dkey[imei] = key;
    }
}

function getKey(imei) {
    if (imei) {
        return imei_dkey[imei];
    }
    return null;
}

function setIMEIByKey(key, imei) {
    if (key) {
        dkey_imei[key] = imei;
    }
}

function getIMEIByKey(key) {
    if (key) {
        return dkey_imei[key];
    }
    return null;
}

function getFeedback(type, fsn) {
    var feedback = new Buffer('787805010001ffff0d0a', 'hex');
    feedback.writeUInt8(type, 3);
    feedback.writeUInt16BE(fsn, 4);
    feedback.writeUInt16BE(crc(feedback.slice(2, 6)), 6);
    
    console.log('<< %s', feedback.toString('hex'));
    return feedback;
}

var lonlatUnit = 1/(500*3600); // degree

function decodeFrame(type, frame) {
    console.log('>> %s', frame.toString('hex'));
    
    var result = {
        type: type,
        valid: false
    };
    
    var dt;
    var len = frame.length;
    if (type === 0x01) { // register
        result.imei  = frame.toString('hex', 4, 12).slice(1);
        result.valid = true;
    } else if (type === 0x12) { // gps
        dt = new Date(
            frame.readUInt8(4) + 2000,
            frame.readUInt8(5) - 1,
            frame.readUInt8(6),
            frame.readUInt8(7),
            frame.readUInt8(8),
            frame.readUInt8(9)
        );
        // CST -> UTC
        result.time     = dt.getTime() + dt.getTimezoneOffset()*60000 - 28800000; // ms
        result.satenum  = frame[10] & 0x0f;                                     // number of satellites
        result.lat      = limitFixDigs(frame.readUInt32BE(11)*lonlatUnit, 6);   // deg
        result.lon      = limitFixDigs(frame.readUInt32BE(15)*lonlatUnit, 6);   // deg
        result.speed    = frame.readUInt8(19);                                  // km/h
        result.course   = (frame.readUInt16BE(20) & 0x03ff);                    // deg
        result.lat      = frame[20] & 0x04 ? result.lat : -1*result.lat;        // N/S?
        result.lon      = frame[20] & 0x08 ? -1*result.lon : result.lon;        // W/E?
        result.gps      = (frame[20]>>4) & 0x01;                                // 0: not, 1: positioning
        result.dgps     = (frame[20]>>5) & 0x01;                                // 0: realtime, 1: differential
        result.valid = true;
    } else if (type === 0x13) { // status
        dt = new Date();
        result.time     = dt.getTime() + dt.getTimezoneOffset()*60000; // UTC
        result.defence  = frame[4] & 0x01;      // 0: off, 1: on
        result.acc      = (frame[4]>>1) & 0x01; // 0: low, 1: high
        result.charging = (frame[4]>>2) & 0x01; // 0: not, 1: charging
        result.alarm    = (frame[4]>>3) & 0x07; // 0: normal, 1: shork, 2: power-down, 3: low-voltage, 4: SOS
        result.gps      = (frame[4]>>6) & 0x01; // 0: not, 1: positioning
        result.oil      = (frame[4]>>7) & 0x01; // 0: on, 1: off
        result.voltage  = frame.readUInt8(5);   // 0 ~ 6
        result.gsm      = frame.readUInt8(6);   // 0 ~ 4
        result.valid    = true;
    } else if (type === 0x15) { // command response
        dt = new Date();
        result.time     = dt.getTime() + dt.getTimezoneOffset()*60000;  // UTC
        result.len      = frame.readUInt8(4);                           // command length
        result.mark     = frame.toString('hex', 5, 9);                  // server side mark
        result.response = frame.toString('ascii', 9, 5+result.len);     // command response
        if (result.response.indexOf('\u0000') > 0) {                    // remove null characters
            result.response = result.response.slice(0, result.response.indexOf('\u0000'));
        }
        result.valid    = true;
    } else if (type === 0x16) { // gps & status
        // gps
        dt = new Date(
            frame.readUInt8(4) + 2000,
            frame.readUInt8(5) - 1,
            frame.readUInt8(6),
            frame.readUInt8(7),
            frame.readUInt8(8),
            frame.readUInt8(9)
        );
        // CST -> UTC
        result.time     = dt.getTime() + dt.getTimezoneOffset()*60000 - 28800000; // ms
        result.satenum  = frame[10] & 0x0f;
        result.lat      = limitFixDigs(frame.readUInt32BE(11)*lonlatUnit, 6);   // deg
        result.lon      = limitFixDigs(frame.readUInt32BE(15)*lonlatUnit, 6);   // deg
        result.speed    = frame.readUInt8(19);                                  // km/h
        result.course   = (frame.readUInt16BE(20) & 0x03ff);                    // deg
        result.lat      = frame[20] & 0x04 ? result.lat : -1*result.lat;
        result.lon      = frame[20] & 0x08 ? -1*result.lon : result.lon;
        result.gps      = (frame[20]>>4) & 0x01;    // 0: not, 1: positioning
        result.dgps     = (frame[20]>>5) & 0x01;    // 0: realtime, 1: differential
        // status
        result.defence  = frame[len-9] & 0x01;      // 0: off, 1: on
        result.acc      = (frame[len-9]>>1) & 0x01; // 0: low, 1: high
        result.charging = (frame[len-9]>>2) & 0x01; // 0: not, 1: charging
        result.alarm    = (frame[len-9]>>3) & 0x07; // 0: normal, 1: shork, 2: power-down, 3: low-voltage, 4: SOS
        result.gps      = (frame[len-9]>>6) & 0x01; // 0: not, 1: positioning
        result.oil      = (frame[len-9]>>7) & 0x01; // 0: on, 1: off
        result.voltage  = frame.readUInt8(len-8);   // 0 ~ 6
        result.gsm      = frame.readUInt8(len-7);   // 0 ~ 4
        result.valid = true;
    }
    
    console.log('== %j', result);
    return result;
}

function limitFixDigs(num, fix) {
    var fig = 0;
    if (typeof fix === 'number') {
        fig = parseFloat(num.toFixed(fix));
    }
    return fig;
}

// encode command string to a formatted frame
// parameters:
// command - ascii string
//    mark - unsigned 32-bit long integer
//     fsn - unsigned 16-bit long integer
function encodeCommand(command, mark, fsn) {
    var len = command.length;
    var frame = new Buffer(15 + len);
    frame[0] = 0x78; frame[1] = 0x78;                           // frame head
    frame.writeUInt8(10 + len, 2);                              // frame content size
    frame.writeUInt8(0x80, 3);                                  // type
    frame.writeUInt8(4 + len, 4);                               // encoded command size
    frame.write(mark, 5, 4, 'hex');                             // server side mark of this command
    frame.write(command, 9, len, 'ascii');                      // command ascii string
    frame.writeUInt16BE(fsn, 9+len);                            // frame serial number
    frame.writeUInt16BE(crc(frame.slice(2, 11+len)), 11+len);   // CRC check sum
    frame[13+len] = 0x0d; frame[14+len] = 0x0a;                 // frame tail
    
    console.log('<< %s', frame.toString('hex'));
    return frame;
}

// send command to device of imei
// parameters:
//    imei - device imei
//    mark - 4 bytes hex string of server side mark
// command - ascii string of command to be sent to device
// returns true on success or false on failure
// eg: sendCommand('684612052104960','DWXX,000000#', '12345678');
function sendCommand(imei, mark, command) {
    // get socket by imei
    var socket = getSocket(imei);
    if (socket) {
        var frame = encodeCommand(command, mark, 0);
        socket.write(frame);
        return true;
    }
    
    return false;
}

// command event handler
xx.events.on('command', function(cmd) {
    var imei = getIMEIByKey(cmd.key);
    if (imei) {
        sendCommand(imei, cmd.mark, cmd.command);
    }
});
