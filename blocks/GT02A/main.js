var net = require('net'),
    io = require('socket.io'),
    route = require('./route'),
    config = require('./config').config;

console.log('GT02A starts at %s', new Date().toISOString());

// start tcp service
var tcp = net.createServer();
tcp.listen(config.port_tcp);

tcp.on('listening', function() {
    console.log("%d - Listening port %d for TCP service in %s mode",
        Date.now(), tcp.address().port, tcp.settings.env);
});

tcp.on('error', function(err) {
    console.log("%d - TCP error: %j", Date.now(), err);
    process.exit(-1);
});

// route tcp events
tcp.on('connection', route.onTCPConnect);    

// start websocket service
var wss = io.listen(config.port_wss);

wss.server.on('listening', function() {
    console.log("%d - Listening port %d for WSS service in %s mode",
        Date.now(), wss.server.address().port, wss.server.settings.env);
});

wss.server.on('error', function(err) {
    console.log("%d - WSS error: %j", Date.now(), err);
    process.exit(-1);
});

// development settings
wss.configure('development', function() {
    wss.set('log level', 3);
    wss.set('transports', ['websocket']);
});

// production settings
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

// route websocket events
wss.sockets.on('connection', route.onWSSConnect);

