var io = require('socket.io'),
    route = require('./route'),
    config = require('./config').config;

var app = io.listen(config.port);

// configuration for web socket server
app.enable('browser client minification');  // send minified client
app.enable('browser client etag');          // apply etag caching logic based on version number
app.enable('browser client gzip');          // gzip for file
app.set('log level', 3);                    // reduce logging
app.set('transports', [                     // enable all transports (optional if you want flashsocket)
    'websocket', 
    'flashsocket', 
    'htmlfile', 
    'xhr-polling', 
    'jsonp-polling'
]);

app.sockets.on('connection', function(socket) {
    route.onConnect(socket);
    // socket events
    socket.on('disconnect', function(){route.onDisconnect(socket);});
    socket.on('message', function(msg){route.onMessage(socket, msg);});
    socket.on('wedata', function(data){route.onWeData(socket, data);});
});

console.log("Weiran listening on port %d", app.server.address().port);
console.log("God bless love....");
