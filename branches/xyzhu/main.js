var express = require('express'),
    io = require('socket.io'),
    route = require('./route'),
    config = require('./config').config;

var web = express.createServer(),
    wss = io.listen(web);

// configuration
web.configure(function() {
    web.use(express.bodyParser());
    web.use(express.cookieParser());
    web.use(express.session({secret: config.key}));
});

// development settings
web.configure('development', function() {
    web.use(express.static(__dirname + '/public'));
    web.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});
wss.configure('development', function() {
    wss.set('log level', 3);
    wss.set('transports', ['websocket']);
});

// production settings
web.configure('production', function() {
    var oneYear = 365*24*60*60*1000;
    web.use(express.static(__dirname + '/public', {maxAge: oneYear}));
    web.use(express.errorHandler());
});
wss.configure('production', function() {
    wss.enable('browser client minification');  // send minified client
    wss.enable('browser client etag');          // apply etag caching logic based on version number
    wss.enable('browser client gzip');          // gzip for file
    wss.set('log level', 1);                    // reduce logging
    wss.set('origins', config.origins);
    wss.set('transports', [                     // enable all transports (optional if you want flashsocket)
        'websocket', 
        'flashsocket', 
        'htmlfile', 
        'xhr-polling', 
        'jsonp-polling'
    ]);
});

// websocket server events
wss.sockets.on('connection', function(socket) {
    route.onConnect(socket);
    socket.on('disconnect', function(){route.onDisconnect(socket);});
    socket.on('message', function(msg){route.onMessage(socket, msg);});
});

// router for web server

web.listen(config.port);

console.log("xyzhu listening on port %d in %s mode", wss.server.address().port, wss.server.settings.env);
console.log("God bless love....");
