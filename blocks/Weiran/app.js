var io = require('socket.io');

io = io.listen(2080);

// configuration for web socket server
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.set('log level', 0);                    // reduce logging
io.set('transports', [                     // enable all transports (optional if you want flashsocket)
    'websocket', 
    'flashsocket', 
    'htmlfile', 
    'xhr-polling', 
    'jsonp-polling'
]);

io.sockets.on('connection', function(socket) {
    console.log('on connection');
});
