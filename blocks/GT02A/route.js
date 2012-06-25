var tcp = require('./lib/tcp');
exports.onTCPConnect = function(socket) {
    tcp.onConnect(socket);
    socket.on('end',        function()      {tcp.onEnd(socket);});
    socket.on('close',      function(err)   {tcp.onClose(socket, err);});
    socket.on('error',      function(err)   {tcp.onError(socket, err);});
    socket.on('timeout',    function()      {tcp.onTimeout(socket);});
    socket.on('data',       function(data)  {tcp.onData(socket, data);});
}

var wss = require('./lib/ws');
exports.onWSSConnect = function(socket) {
    wss.onConnect(socket);
    socket.on('disconnect', function()      {wss.onDisconnect(socket);});
    socket.on('message',    function(msg)   {wss.onMessage(socket, msg);});
    socket.on('subscribe',  function(device){wss.onSubscribe(socket, device);});
    socket.on('devicedata', function(data)  {wss.onDeviceData(socket, data);});
}

// starts to connect db
var dbs = require('./lib/db');
