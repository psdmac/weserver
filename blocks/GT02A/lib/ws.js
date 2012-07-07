var xx = require("./xx"),
    db = require('./db');

var sio = null,
    deviceID = {}, // {key: id}
    lastData = {}; // {key: {}}

exports.onConnect = function(socket) {
    // local reference to websocket server
    if (!sio) {
        sio = socket.manager;
    }
};

exports.onDisconnect = function(socket) {
};

exports.onMessage = function(socket, msg) {
};

// device = {id: 'id', key: 'key'}
exports.onSubscribe = function(socket, device) {
    if (!device || !device.id || !device.key) {
        socket.disconnect();
        return;
    }
    
    // store device sn and key
    deviceID[device.key] = device.id;
    
    // join the room of this device key
    socket.join(device.key);
    
    // feedback with last data of this device
    if (lastData[device.key] && sio) {
        sio.sockets.in(device.key).emit('devicedata', lastData[device.key]);
    }
};

// query history data
exports.onDeviceData = function(socket, data) {
    // data = {type, key, t0, t1}
    if (!data || data.type !== 'devicehtdata' || !deviceID[data.key]) {
        return;
    }

    db.find(data.key, data.t0, data.t1, function(result) {
        sio.sockets.in(data.key).emit('devicedata', {
            id: deviceID[data.key],      // weiran device protocol
            type: 'devicehtdata',   // weiran device protocol
            htdata: result
        });
    });
};

// forward realtime device data
xx.events.on('gt02a', function(gt02a) {
    if (!lastData[gt02a.key]) {
        lastData[gt02a.key] = {
            type: 'devicertdata'        // weiran device protocol
        };
    }
    
    var data = lastData[gt02a.key];
    data.time = gt02a.time;
    
    if (gt02a.protocol === 0x10) { // valid PVT
        data.count = gt02a.count;
        if (gt02a.stgps === 1) {
            data.lonlat = [gt02a.longitude, gt02a.latitude]; // weiran device protocol
            data.angle = gt02a.course; // weiran device protocol
            data.speed = gt02a.velocity;
        }
        data.stgps = gt02a.stgps;
        data.stpow = gt02a.stpow;
        data.stsos = gt02a.stsos;
        data.stoff = gt02a.stoff;
        data.alarm = gt02a.stsos || gt02a.stoff; //weiran device protocol
    } else if (gt02a.protocol === 0x1a) { // status
        data.spow = gt02a.power;
        data.sgsm = gt02a.gsm;
        data.sgps = gt02a.satenum;
    }

    data.id = deviceID[gt02a.key] || data.id;
    
    if (data.id && sio) {
        sio.sockets.in(gt02a.key).emit('devicedata', data);
    }
});

