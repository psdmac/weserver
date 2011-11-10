// WeRealtimeGT02ANode.js is a part of Weiran server suites.
// Tian Yantao @ www.weiran.biz
// V11.07, last update: 2011-11-10

weConfig = require('/usr/local/etc/WeRealtimeGT02ANode.conf');
util = require('util');
zmq = require('/usr/local/lib/node_modules/zmq');
sio = require('/usr/local/lib/node_modules/socket.io');

// to save all terminals last pvt and pgg data
lastPVT = {};
lastPGG = {};
// imei-sockets map
mapImeiSockIds = {};

// start services
zsock = zmq.createSocket('sub');
zsock.connect(weConfig.downbridge);
zsock.subscribe(weConfig.pggmask);
zsock.subscribe(weConfig.pvtmask);
util.log('connet to ' + weConfig.downbridge);
util.log('subscribe ' + weConfig.pggmask + ' data');
util.log('subscribe ' + weConfig.pvtmask + ' data');

sio = sio.listen(weConfig.port);
util.log('listen port: ' + weConfig.port);

// configuration for web socket
sio.enable('browser client minification');  // send minified client
sio.enable('browser client etag');          // apply etag caching logic based on version number
sio.set('log level', 1);                    // reduce logging
sio.set('transports', [                     // enable all transports (optional if you want flashsocket)
    'websocket', 
    'flashsocket', 
    'htmlfile', 
    'xhr-polling', 
    'jsonp-polling'
]);

// web socket event handlers
sio.sockets.on('connection', function (socket) {
    //util.log('conncetion');
    socket.on('setimei', function (imei) {
        // validate imei
        if ( typeof imei !== 'string' || imei.length !== 15 ) {
            util.log('invalid imei: ' + imei);
            return;
        }
        // add to imei-sockets map
        socket.imei = imei;
        if ( typeof mapImeiSockIds[imei] === 'undefined' ) {
            mapImeiSockIds[imei] = {};
        }
        mapImeiSockIds[imei][socket.id] = socket;
        // update client with last data
        if ( lastPVT[imei] ) {
            socket.emit('updatepvt', lastPVT[imei]);
        }
        if ( lastPGG[imei] ) {
            socket.emit('updatepgg', lastPGG[imei]);
        }
        //util.log('set < mapImeiSockIds.' + imei + '.' + socket.id);
    });
    socket.on('disconnect', function () {
        // remove item from imei-sockets map
        if ( mapImeiSockIds[socket.imei] && mapImeiSockIds[socket.imei][socket.id] )
        delete mapImeiSockIds[socket.imei][socket.id];
        //util.log('del < mapImeiSockIds.' + socket.imei + '.' + socket.id);
    });
});

// zeromq event handlers
zsock.on('message', function (data) {
    //util.log('message: ' + data.toString('hex'));
    // decode hex data to json object
// Position, Velocity and Time data of GT02A from GT02A.h
/*
struct gt02apvt_t {             // 48 bytes
    char            model;      // 0-1 sensor model
    char            dtype;      // 1-2 data type
    char            imei[16];   // 2-18 terminal id
    unsigned short  fsn;        // 18-20 serial number of frame
    unsigned int    t;          // 20-24 time stamp in s
    double          lat;        // 24-32 latitude in deg
    double          lon;        // 32-40 longitude in deg
    unsigned short  c;          // 40-42 course of vehicle in deg
    unsigned char   v;          // 42-43 velocity in km/h
    unsigned char   stgps;      // 43-44 status of gps, 0: not ok, 1: ok
    unsigned char   stpow;      // 44-45 status of power, 0: battery, 1: charging
    unsigned char   stsos;      // 45-46 status of sos, 0: normal, 1: sos
    unsigned char   strun;      // 46-47 status of running, 0: normal, 1: power off alarm
    bool            valid;      // 47-48
};

// Power, GSM and GPS status of GT02A
struct gt02apgg_t {             // 32 bytes
    char            model;      // 0-1 sensor model
    char            dtype;      // 1-2 data type
    char            imei[16];   // 2-18 terminal id
    unsigned short  fsn;        // 18-20 serial number of frame
    unsigned int    t;          // 20-24 local time stamp
    unsigned char   stpow;      // 24-25 status of power: 0~6
    unsigned char   stgsm;      // 25-26 status of gsm signal: 0~4
    unsigned char   stgps;      // 26-27 status of gps, 0: not ok, 1: ok, 2: differential
    unsigned char   nsate;      // 27-28 number of satellite of this positioning
    bool            valid;      // 28-32
};
*/
    var tmn = {};
    tmn.model = data.toString('ascii', 0, 1);
    tmn.dtype = data.toString('ascii', 1, 2); // g pvt data, s status data
    tmn.imei = data.toString('ascii', 2, 17);
    tmn.fsn = data.readUInt16LE(18);
    tmn.t = data.readUInt32LE(20);
    switch (tmn.dtype) {
    case 'g': // pvt data
        tmn.lat = data.readDoubleLE(24);
        tmn.lon = data.readDoubleLE(32);
        tmn.c = data.readUInt16LE(40);
        tmn.v = data[42];
        tmn.stgps = data[43];
        tmn.stpow = data[44];
        tmn.stsos = data[45];
        tmn.strun = data[46];
        tmn.valid = true;
        //tmn.
        break;
    case 's': // pgg data
        tmn.stpow = data[24];
        tmn.stgsm = data[25];
        tmn.stgps = data[26];
        tmn.nsate = data[27];
        tmn.valid = true;
        break;
    }
    
    // emit data to target clients
    emitData(tmn);
});

zsock.on('error', function (error) {
    util.log('zeromq error: ' + error);
});

function emitData(tmn) {
    var socks, i;
    
    if ( typeof tmn === 'object' && tmn.imei ) {
        // update last data array
        if ( tmn.dtype && tmn.dtype === 'g' ) {
            lastPVT[tmn.imei] = tmn;
            // update connceted browsers data
            if ( mapImeiSockIds[tmn.imei] ) {
                socks = mapImeiSockIds[tmn.imei];
                for (i in socks ) {
                    if ( socks.hasOwnProperty(i) ) {
                        socks[i].emit('updatepvt', tmn);
                        //util.log('pvt > mapImeiSockIds.' + tmn.imei + '.' + i);
                    }
                }
            }
        }
        if ( tmn.dtype && tmn.dtype === 's' ) {
            lastPGG[tmn.imei] = tmn;
            // update connceted browsers data
            if ( mapImeiSockIds[tmn.imei] ) {
                socks = mapImeiSockIds[tmn.imei];
                for ( i in socks ) {
                    if ( socks.hasOwnProperty(i) ) {
                        socks[i].emit('updatepgg', tmn);
                        //util.log('pgg > mapImeiSockIds.' + tmn.imei + '.' + i);
                    }
                }
            }
        }
    }
}
