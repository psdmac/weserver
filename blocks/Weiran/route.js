// data event handlers

// websocket router
var router = {};
var account = require('./lib/account');
router['accountsignin'] = account.signin;
router['accountforget'] = account.forget;
router['accountcreate'] = account.create;
router['accountupdate'] = account.update;

exports.onWeData = function(socket, data) {
    //console.log('on wedata: socket id is ' + socket.id + ', data is ' + JSON.stringify(data));
    if (data && data.type && typeof router[data.type] === 'function') {
        router[data.type](socket, data);
    }
};

// default socket event handlers

exports.onConnect = function(socket) {
    //console.log('on connect: socket id is ' + socket.id);
};

exports.onDisconnect = function(socket) {
    //console.log('on disconnect: socket id is ' + socket.id);
};

exports.onMessage = function(socket, msg) {
    //console.log('on message: socket id is ' + socket.id + ', message is ' + msg);
};

// http router
exports.activateAccount = account.activateAccount;
exports.resetPassword = account.resetPassword;
