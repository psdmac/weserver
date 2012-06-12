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
        Device.findById(data.sn, function(err, device) {
            if (err) { // db error
                feedback.status = 5;
                socket.emit('wedata', feedback);
                console.log('db error: %j', err);
                return;
            }
            if (!device || device.key !== data.key) { // not found or identification code error
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
                    sn: data.sn, // serial number
                    model: device.model,
	                opts: device.opts // options for class type
                };
                account.devices.push(dev);
                account.markModified('devices');
                account.save(function(err) {
                    if (err) { // db error
                        feedback.status = 9;
                        // unuse device
                        device.used = false;
                        device.save(function(derr) {if (derr) {console.log('db error: %j', derr);}});
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
            if (account.devices[i].sn === data.sn) {
                if (typeof data.title === 'string') {
                    account.devices[i].opts.title = data.title;
                }
                if (typeof data.icon === 'string') {
                    account.devices[i].opts.icon = data.icon;
                }
                if (typeof data.alarm === 'string') {
                    account.devices[i].opts.alarm = data.alarm;
                }
                if (Array.isArray(data.lonlat) && data.lonlat.length === 2) {
                    account.devices[i].opts.lonlat = data.lonlat;
                }
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
                if (typeof data.title === 'string') {
                    feedback.title = data.title;
                }
                if (typeof data.icon === 'string') {
                    feedback.icon = data.icon;
                }
                if (typeof data.alarm === 'string') {
                    feedback.alarm = data.alarm;
                }
                // DO NOT mail notify
                //mailer.sendDeviceUpdateMail(account.email, account.user, data.lang, data.sn);
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
            
            feedback.sn = data.sn;
            // mail notify
            mailer.sendDeviceDeleteMail(account.email, account.user, data.lang, data.sn);

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
    
    var request = JSON.parse(req.body.dstr);
	    
	if (!request.key || !request.model || !request.admin || typeof request.opts !== 'object') {
	    res.send('error: 3, invalid query parameters');
	    return;
	}
	
	var device = new Device();
	device.key = request.key;
	device.model = request.model;
	device.created_by = request.admin;
	device.opts = request.opts;
	
	Device.findOne({key: device.key}, function(err, dev) {
	    if (err) {
	        console.log('db error: %j', err);
	        res.send('error: 4, db error');
	        return;
	    }
        if (dev) { // duplicate id code
            res.send('error: 5, duplicate identification code: ' + device.key);
            return;
        }
    
        device.save(function(err) {
            if (err) { // db error
                console.log('db error: %j', err);
	            res.send('error: 6, db error');
	            return;
            }
            var sn = device._id.toString();
            
            res.send('OK, serial number: ' +
                sn.slice(0,8) + '-' + sn.slice(8,14) + '-' + sn.slice(14,18) + '-' + sn.slice(18));
        });
    });
};

exports.adminQuery = function(req, res) {
    if (!req.session.validated) {
        res.send('{"error": 1, "reason": "access denied"}');
	    return;
    }
    
    Device.find({}, function(err, devs) {
	    if (err) {
	        console.log('db error: %j', err);
	        res.send('{"error": 2, "reason": "db error"}');
	        return;
	    }
	    
	    var i, len, sn, key, devices = [];
	    for (i=0, len=devs.length; i<len; i++) {
	        sn = devs[i]._id.toString();
	        key = devs[i].key;
	        devices.push({
                sn: sn.slice(0,8) + '-' + sn.slice(8,14) + '-' + sn.slice(14,18) + '-' + sn.slice(18),
                key: key.slice(0,8) + '-' + key.slice(8,12) + '-' + key.slice(12,16) + '-' + key.slice(16,20)  + '-' + key.slice(20),
                model: devs[i].model,
                used: devs[i].used,
	            admin: devs[i].created_by
	        });
	    }
        
        res.send(JSON.stringify(devices));
    });
};
