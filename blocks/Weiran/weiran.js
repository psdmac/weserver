var express = require('express'),
    MongoStore = require('connect-mongo')(express),
    io = require('socket.io'),
    route = require('./route'),
    config = require('./config').config;

var http = express.createServer();
var ws = io.listen(http);

// configuration
http.configure(function() {
    http.use(express.bodyParser());
    http.use(express.cookieParser());
    http.use(express.session({
        secret: config.key,
        store: new MongoStore({url: (config.db + '/sessions')})
    }));
});

// development settings
http.configure('development', function() {
    http.use(express.static(__dirname + '/public'));
    http.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});
ws.configure('development', function() {
    ws.set('log level', 3);
    ws.set('transports', ['websocket']);
});

// production settings
http.configure('production', function() {
    var oneYear = 365*24*60*60*1000;
    http.use(express.static(__dirname + '/public', {maxAge: oneYear}));
    http.use(express.errorHandler());
});
ws.configure('production', function() {
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
});

// websocket events
ws.sockets.on('connection', function(socket) {
    route.onConnect(socket);
    socket.on('disconnect', function(){route.onDisconnect(socket);});
    socket.on('subscribe',  function(sid){route.onSubscribe(socket, sid);});
    socket.on('message',    function(msg){route.onMessage(socket, msg);});
    socket.on('wedata',     function(data){route.onWeData(socket, data);});
});

// router for http
http.get( '/activate/account',      route.activateAccount);
http.get( '/reset/password',        route.resetPassword);
http.post('/admin/validate',        route.validateAdmin);
http.post('/admin/device/create',   route.createDevice);
http.get( '/admin/device/query',    route.queryDevice);

http.listen(config.port);

console.log('-- %s', new Date().toISOString());
console.log("Weiran listening on port %d in %s mode", ws.server.address().port, ws.server.settings.env);
console.log("God bless love....");
