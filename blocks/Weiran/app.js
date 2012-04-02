var express = require('express'),
    io = require('socket.io'),
    route = require('./route'),
    config = require('./config').config;

var http = express.createServer();
var ws = io.listen(http);

// configuration for web socket server
ws.enable('browser client minification');  // send minified client
ws.enable('browser client etag');          // apply etag caching logic based on version number
ws.enable('browser client gzip');          // gzip for file
ws.set('log level', 1);                    // reduce logging
ws.set('origins', config.origins);
ws.set('transports', [                     // enable all transports (optional if you want flashsocket)
    'websocket', 
    'flashsocket', 
    'htmlfile', 
    'xhr-polling', 
    'jsonp-polling'
]);

ws.sockets.on('connection', function(socket) {
    // router for websocket
    route.onConnect(socket);
    // socket events
    socket.on('disconnect', function(){route.onDisconnect(socket);});
    socket.on('message', function(msg){route.onMessage(socket, msg);});
    socket.on('wedata', function(data){route.onWeData(socket, data);});
});

// router for http
http.get('/activate/account', route.activateAccount);
http.get('/reset/password', route.resetPassword);

http.listen(config.port);
console.log("Weiran listening on port %d", ws.server.address().port);
console.log("God bless love....");
