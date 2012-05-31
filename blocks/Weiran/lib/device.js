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
        Device.findOne({sn: data.sn}, function(err, device) {
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
                    sn: device.sn, // serial number
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
            if (account.devices[i].sn == data.sn) {
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
            if (account.devices[i].sn === data.sn) {
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
            Device.findOne({sn: data.sn}, function(err, device) {
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

exports.adminCreate = function(req, res) {
    if (!req.session.validated) {
        res.send('error: 1, access denied');
	    return;
    }
    
    if (!req.body.dstr) {
        res.send('error: 2, invalid query parameters');
	    return;
    }
    
    req.body = JSON.parse(req.body.dstr);
    var admin = req.body.admin,
        model = req.body.model,
	    type = req.body.type,
	    opts = req.body.opts;
	    
	if (!admin || !model || !type || !opts) {
	    res.send('error: 3, invalid query parameters');
	    return;
	}
	
	var device = new Device();
	device.sn = md5(device._id + config.key).slice(8, 24);
	device.created_by = admin;
	device.model = model;
	device.type = type;
	device.opts = opts;
	
	Device.findOne({sn: device.sn}, function(err, dev) {
	    if (err) {
	        console.log('db error: %j', err);
	        res.send('error: 4, db error');
	        return;
	    }
        if (dev) { // duplicate sn
            res.send('error: 5, duplicate serial number: ' + device.sn);
            return;
        }
    
        device.save(function(err) {
            if (err) { // db error
                console.log('db error: %j', err);
	            res.send('error: 6, db error');
	            return;
            }
            res.send('OK, serial number: ' + device.sn);
        });
    });
};
