function onConnect(socket) {
    //console.log('on connect: socket id is ' + socket.id);
};

function onDisconnect(socket) {
    //console.log('on disconnect: socket id is ' + socket.id);
};

function onMessage(socket, msg) {
    //console.log('on message: socket id is ' + socket.id + ', message is ' + msg);
};

exports.onConnect = onConnect;
exports.onDisconnect = onDisconnect;
exports.onMessage = onMessage;
