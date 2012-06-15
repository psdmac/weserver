// global routes hash
var router = {};

function onConnect(socket) {
    //console.log('on connect: socket id is ' + socket.id);
};

function onDisconnect(socket) {
    //console.log('on disconnect: socket id is ' + socket.id);
};

function onSubscribe(socket, sid) {
    if (typeof sid === 'string' && sid.length>0) {
        // store client session id
        socket.set('clientsessionid', sid);
        // create a room for this session
        socket.join(sid);
    }
};

function onMessage(socket, msg) {
    //console.log('on message: socket id is ' + socket.id + ', message is ' + msg);
};

function onWeData(socket, data) {
    //console.log('on wedata: socket id is ' + socket.id + ', data is ' + JSON.stringify(data));
    if (data && data.type && typeof router[data.type] === 'function') {
        // get room of this session
        socket.get('clientsessionid', function(err, sid) {
            if (!err && sid) {
                router[data.type](socket.manager, sid, data);
            } else {
                // illegel access
                console.log('web socket error: %j, abort data: %j', err, data);
            }
        });
    }
};

//=============================================================
// Websocket event handlers
//-------------------------------------------------------------
exports.onConnect = onConnect;
exports.onDisconnect = onDisconnect;
exports.onSubscribe = onSubscribe;
exports.onMessage = onMessage;
exports.onWeData = onWeData;

//=============================================================
// Router for accounts
//-------------------------------------------------------------
// websocket router
var account = require('./lib/account');
router['accountsignin'] = account.signin;
router['accountlogout'] = account.logout;
router['accountforget'] = account.forget;
router['accountcreate'] = account.create;
router['accountupdate'] = account.update;
// http router
exports.activateAccount = account.activateAccount;
exports.resetPassword = account.resetPassword;
exports.validateAdmin = account.validateAdmin;

//=============================================================
// Router for devices
//-------------------------------------------------------------
// websocket router
var device = require('./lib/device');
router['devicecreate'] = device.create;
router['deviceupdate'] = device.update;
router['devicedelete'] = device.remove;
// http router
exports.createDevice = device.adminCreate;
exports.queryDevice = device.adminQuery;

