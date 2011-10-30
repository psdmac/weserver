// WeRealtimeGT02ANode.js is a part of Weiran server suites.
// Tian Yantao @ www.weiran.biz
// V11.07, last update: 2011-10-30

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
zsock = zmq.createSocket('pull');
zsock.connect(weConfig.host);
util.log('connet to ' + weConfig.host);
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
    //util.log('message: ' + data);
    
    var tmn, socks, i;
    
    try {
        tmn = JSON.parse(data.toString('ascii'));
    } catch (e) {
        util.log('bad json: ' + data.toString('ascii'));
        return;
    }
    
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
});

zsock.on('error', function (error) {
    util.log('zeromq error: ' + error);
});

