var Account = require('../model').Account,
    Device = require('../model').Device,
    //md5 = require('./md5').md5,
    mailer = require('./mail'),
    config = require('../config').config;
    
exports.create = function(socket, data) {
    var feedback = {
        type: data.type,
        status: 0
    };

    // processing
    socket.emit('wedata', feedback);
    
    // find account
    Account.findOne({user: data.user}, function(err, account) {
        if (err) { // db error
            feedback.status = 1;
            socket.emit('wedata', feedback);
            console.log('db error: %j', err);
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
        
        // find device
        Device.findById(data.sn, function(err, device) {
            if (err) { // db error
                feedback.status = 5;
                socket.emit('wedata', feedback);
                console.log('db error: %j', err);
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
            // set device used
            device.used = true;
            device.user = account.user;
            device.used_at = Date.now();
            device.save(function(err) {
                if (err) { // db error
                    feedback.status = 8;
                    socket.emit('wedata', feedback);
                    console.log('db error: %j', err);
                    return;
                }
                // add to account.device
                var dev = {
                    id: device._id.toString(), // serial number
                    model: device.model,
	                type: device.type,
	                opts: device.opts // options for class type
                };
                account.devices.push(dev);
                account.markModified('devices');
                account.save(function(err) {
                    if (err) { // db error
                        feedback.status = 9;
                        console.log('db error: %j', err);
                    } else { // ok
                        feedback.status = 10;
                        feedback.device = dev;
                        // mail notify
                        mailer.sendDeviceCreateMail(account.email, account.user, data.lang, data.sn);
                    }
                    socket.emit('wedata', feedback);
                })
            });
        });
    });
};

exports.update = function(socket, data) {
    var feedback = {
        type: data.type,
        status: 0
    };

    // processing
    socket.emit('wedata', feedback);
    
    // find account
    Account.findOne({user: data.user}, function(err, account) {
        if (err) { // db error
            feedback.status = 1;
            socket.emit('wedata', feedback);
            console.log('db error: %j', err);
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
        
        // update device in account.devices array
        for(var i = account.devices.length - 1; i >= 0; i--) {
            if (account.devices[i].id == data.sn) {
                account.devices[i].opts.title = data.title;
                account.devices[i].opts.icon = data.icon;
                break;
            }
        }
        
        account.markModified('devices');
        account.save(function(err) {
            if (err) { // db error
                feedback.status = 5;
                console.log('db error: %j', err);
            } else { // ok
                feedback.status = 6;
                feedback.sn = data.sn;
                feedback.icon = data.icon;
                feedback.title = data.title;
                // mail notify
                mailer.sendDeviceUpdateMail(account.email, account.user, data.lang, data.sn);
            }
            socket.emit('wedata', feedback);
        });
    });
};

exports.remove = function(socket, data) {
    var feedback = {
        type: data.type,
        status: 0
    };

    // processing
    socket.emit('wedata', feedback);
    
    // find account
    Account.findOne({user: data.user}, function(err, account) {
        if (err) { // db error
            feedback.status = 1;
            socket.emit('wedata', feedback);
            console.log('db error: %j', err);
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
        
        // remove device from account.devices array
        for(var i = account.devices.length - 1; i >= 0; i--) {
            if (account.devices[i].id === data.sn) {
                account.devices.splice(i,1);
                break;
            }
        }
        
        account.markModified('devices');
        account.save(function(err) {
            if (err) { // db error
                feedback.status = 5;
                socket.emit('wedata', feedback);
                console.log('db error: %j', err);
                return;
            }
            // unuse this device
            Device.findById(data.sn, function(err, device) {
                if (err) { // db error
                    feedback.status = 6;
                    socket.emit('wedata', feedback);
                    console.log('db error: %j', err);
                    return;
                }
                if (!device) { // not found
                    feedback.status = 7;
                    socket.emit('wedata', feedback);
                    return;
                }
                device.used = false;
                device.save(function(err) {
                    if (err) { // db error
                        feedback.status = 8;
                        console.log('db error: %j', err);
                    } else { // ok
                        feedback.status = 9;
                        feedback.sn = data.sn;
                        // mail notify
                        mailer.sendDeviceDeleteMail(account.email, account.user, data.lang, data.sn);
                    }
                    socket.emit('wedata', feedback);
                });
            });
        });
    });
};
