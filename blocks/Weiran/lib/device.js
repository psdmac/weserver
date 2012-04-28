var Account = require('../model').Account,
    Device = require('../model').Device,
    md5 = require('./md5').md5,
    mailer = require('./mail'),
    config = require('../config').config;
    
exports.create = function(socket, data) {
    var feedback = {
        type: data.type,
        status: 0
    };

    // processing
    socket.emit('wedata', feedback);
    
    Account.findOne({user: data.user}, function(err, account) {
        if (err) { // db error
            feedback.status = 1;
            socket.emit('wedata', feedback);
            console.log('db error: ' + JSON.stringify(err));
            return;
        }
        if(!account) { // not found
            feedback.status = 2;
            socket.emit('wedata', feedback);
            return;
        }
        if (!account.active) {
            feedback.status = 3;
            socket.emit('wedata', feedback);
            return;
        }
        if (data.token !== account.token) {
            feedback.status = 4;
            socket.emit('wedata', feedback);
            return;
        }
        
        console.log("account %j", account);
        // find device
        Device.findById(data.sn, function(err, device) {
            if (err) { // db error
                feedback.status = 5;
                socket.emit('wedata', feedback);
                console.log('db error: ' + JSON.stringify(err));
                return;
            }
            if (!device) { // not found
                feedback.status = 6;
                socket.emit('wedata', feedback);
                return;
            }
            if (device.used) {
                feedback.status = 7;
                socket.emit('wedata', feedback);
                return;
            }
            console.log("device %j", device);
        });
    });
    console.log("%j", data);
};

exports.update = function(socket, data) {
    var feedback = {
        type: data.type,
        status: 0
    };

    // processing
    socket.emit('wedata', feedback);
    console.log("%j", data);
};

exports.remove = function(socket, data) {
    var feedback = {
        type: data.type,
        status: 0
    };

    // processing
    socket.emit('wedata', feedback);
    console.log("%j", data);
};
