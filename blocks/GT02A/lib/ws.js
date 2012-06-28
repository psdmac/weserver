var xx = require("./xx"),
    db = require('./db');

var sio = null,
    deviceID = {}, // {key: id}
    lastPVT = {},
    lastPGG = {};

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

// device = {sn: 'sn', key: 'key'}
exports.onSubscribe = function(socket, device) {
    if (!device || !device.sn || !device.key) {
        socket.disconnect();
        return;
    }
    
    // store device sn and key
    deviceID[device.key] = device.sn;
    
    // join the room of this device key
    socket.join(device.key);
    
    // feedback with last data of this device
    if (lastPVT[device.key] && sio) {
        sio.sockets.in(gt02a.key).emit('devicedata', lastPVT[device.key]);
    }
    if (lastPGG[device.key] && sio) {
        sio.sockets.in(gt02a.key).emit('devicedata', lastPGG[device.key]);
    }
};

// query history data
exports.onDeviceData = function(socket, data) {
};

// forward realtime device data
xx.events.on('gt02a', function(gt02a) {
    var data = {
        type: 'devicertdata'        // weiran device protocol
    };
    
    if (gt02a.protocol === 0x10) { // PVT
        data.time = gt02a.time;
        data.count = gt02a.count;
        data.lonlat = [gt02a.longitude, gt02a.latitude]; // weiran device protocol
        data.angle = gt02a.course; // weiran device protocol
        data.speed = gt02a.velocity;
        data.stgps = gt02a.stgps;
        data.stpow = gt02a.stpow;
        data.stsos = gt02a.stsos;
        data.stoff = gt02a.stoff;
        data.alarm = gt02a.stsos || gt02a.stoff; //weiran device protocol
        // save as last epoch data
        lastPVT[gt02a.key] = data;
    } else if (gt02a.protocol === 0x1a) { // status
        data.time = Date.now();
        data.count = gt02a.count;
        data.spow = gt02a.power;
        data.sgsm = gt02a.gsm;
        data.sgps = gt02a.satenum;
        // save as last epoch data
        lastPGG[gt02a.key] = data;
    }

    if (deviceID[gt02a.key] && sio) {
        data.id = deviceID[gt02a.key];
        sio.sockets.in(gt02a.key).emit('devicedata', data);
    }
});

