// global routes hash
var router = {};

function onConnect(socket) {
    //console.log('on connect: socket id is ' + socket.id);
};

function onDisconnect(socket) {
    //console.log('on disconnect: socket id is ' + socket.id);
};

function onMessage(socket, msg) {
    //console.log('on message: socket id is ' + socket.id + ', message is ' + msg);
};

function onWeData(socket, data) {
    //console.log('on wedata: socket id is ' + socket.id + ', data is ' + JSON.stringify(data));
    if (data && data.type && typeof router[data.type] === 'function') {
        router[data.type](socket, data);
    }
};

//=============================================================
// Websocket event handlers
//-------------------------------------------------------------

exports.onConnect = onConnect;
exports.onDisconnect = onDisconnect;
exports.onMessage = onMessage;
exports.onWeData = onWeData;


//=============================================================
// Router for accounts
//-------------------------------------------------------------

// websocket router
var account = require('./lib/account');
router['accountsignin'] = account.signin;
router['accountforget'] = account.forget;
router['accountcreate'] = account.create;
router['accountupdate'] = account.update;
// http router
exports.activateAccount = account.activateAccount;
exports.resetPassword = account.resetPassword;

