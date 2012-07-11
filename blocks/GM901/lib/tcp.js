var net = require('net');
var tcp = net.createServer();
var tcp_client_timeout, tcp_client_keepalive;

tcp.on('listening', function() {
    console.log("%d - Listening port %d for TCP service", Date.now(), tcp.address().port);
});

tcp.on('error', function(error) {
    console.log("%d - TCP error: %j", Date.now(), error);
    process.exit(-1);
});

tcp.on('connection', function(socket) {
    console.log("%d - on TCP client connect, total: %d", Date.now(), tcp.connections);
    
    // configure client
    socket.setNoDelay(true);
    socket.setTimeout(tcp_client_timeout);
    socket.setKeepAlive(true, tcp_client_keepalive);
    
    socket.on('error', function(error) {
        console.log("%d - TCP client error: %j", Date.now(), error);
    });
    
    socket.on('end', function() {
        console.log("%d - on TCP client end, total: %d", Date.now(), tcp.connections);
    });
    
    socket.on('close', function(had_error) {
        console.log("%d - on TCP client end, total: %d", Date.now(), tcp.connections);
    });
    
    socket.on('timeout', function() {
        console.log("%d - on TCP client timeout", Date.now());
    });
    
    socket.on('data', function(buffer) {
    });
});

exports.start = function(port, timeout, keepalive) {
    tcp.listen(port);
    
    tcp_client_timeout = timeout || 600;    // seconds
    tcp_client_keepalive = keepalive || 60; // seconds
    tcp_client_timeout = tcp_client_timeout*1000;       // ms
    tcp_client_keepalive = tcp_client_keepalive*1000;   // ms
};
