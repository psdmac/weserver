var Account = require('../model').Account,
    md5 = require('./md5').md5,
    mailer = require('./mail'),
    config = require('../config').config;

exports.signin = function(socket, data) {
    var feedback = {
        type: data.type,
        status: 0
    };

    // processing
    socket.emit('wedata', feedback);
    
    Account.findOne({user: data.user}, function(err, account) {
        if (err) { // db error
            feedback.status = 1;
            console.log('db error: ' + JSON.stringify(err));
        } else if(!account) { // not found
            feedback.status = 2;
        } else if (data.pswd !== account.pswd) {
            feedback.status = 3;
        } else if (!account.active) {
            feedback.status = 4;
        } else { // ok
            feedback.account = {
                user: account.user,
                pswd: account.pswd,
                email: account.email,
                avatar: account.avatar,
                lonlat: account.lonlat,
                apps: account.apps,
                devices: account.devices,
                features: account.features
            };
            feedback.status = 5;
        }
        socket.emit('wedata', feedback);
    });
};

exports.forget = function(socket, data) {
    var feedback = {
        type: data.type,
        status: 0
    };

    // processing
    socket.emit('wedata', feedback);
    
    Account.findOne({user: data.user}, function(err, account) {
        if (err) { // db error
            feedback.status = 1;
            console.log('db error: ' + JSON.stringify(err));
        } else if(!account) { // not found
            feedback.status = 2;
        } else if (data.pswd !== account.pswd) {
            feedback.status = 3;
        } else if (!account.active) {
            feedback.status = 4;
        } else { // ok
            feedback.account = {
                user: account.user,
                pswd: account.pswd,
                email: account.email,
                avatar: account.avatar,
                lonlat: account.lonlat,
                apps: account.apps,
                devices: account.devices,
                features: account.features
            };
            feedback.status = 5;
        }
        socket.emit('wedata', feedback);
    });
};

exports.create = function(socket, data) {
    var feedback = {
        type: data.type,
        status: 0
    };

    // processing
    socket.emit('wedata', feedback);
    
    Account.find({'$or': [{user: data.user}, {email: data.email}]}, function(err, accounts) {
        if(err) { // db error
            feedback.status = 1;
            socket.emit('wedata', feedback);
            console.log('db error: ' + JSON.stringify(err));
            return;
        }
        if(accounts && accounts.length > 0) {
            // user / email using
            feedback.status = 2;
            socket.emit('wedata', feedback);
            return;
        }
        
        // create gavatar
        var avatar_url = 'http://www.gravatar.com/avatar/' + md5(data.email) + '?size=32';
        var account = new Account();
        account.user = data.user;
        account.pswd = data.pswd;
        account.email = data.email;
        account.active = false;
        account.avatar = avatar_url;
        
        account.save(function(err) {
            if (err) { // db error
                feedback.status = 3;
                socket.emit('wedata', feedback);
                console.log('db error: ' + JSON.stringify(err));
                return;
            }
            // send a mail
            var token = md5(data.user + data.email, config.key);
            mailer.sendActivateMail(data.email, data.user, token, data.lang, function(err, res) {
                if (err) { // mailer error
                    feedback.status = 4;
                    console.log('mailer error: ' + JSON.stringify(err));
                } else { // ok
                    feedback.status = 5;
                }
                socket.emit('wedata', feedback);
            });
        });
    });
};

exports.update = function(socket, data) {
    console.log('account.update');
};

exports.activateAccount = function(req, res) {
    var key = req.query.key || '',
	    user = req.query.user || '',
	    email = req.query.email || '',
	    lang = req.query.language || 'en';
	
	Account.findOne({user: user}, function(err, account) {
        if (err || !account || md5(user+email, config.key) !== key) {
            if (lang == 'zh-CN') {
                res.send('链接已失效');
            } else { // default 'en'
                res.send('Invalid request.');
            }
            return;
        }
        if(account.active) {
            if (lang == 'zh-CN') {
                res.send('该账号已经被激活。');
            } else { // default 'en'
                res.send('This account is already activated.');
            }
            return;
        }
        
        account.active = true;
        account.save(function(err) {
            if (err) {
                if (lang == 'zh-CN') {
                    res.send('非常抱歉，系统无法激活该账号。');
                } else { // default 'en'
                    res.send('Sorry, this account could not be activated.');
                }
            } else {
                if (lang == 'zh-CN') {
                    res.send('恭喜，您现在可以使用该帐号登录系统了。');
                } else { // default 'en'
                    res.send('Success, now you can sign in to system with this account.');
                }
            }
        });
    });
};

exports.resetPassword = function(req, res) {
    var key = req.query.key || '',
	    user = req.query.user || '',
	    email = req.query.email || '',
	    lang = req.query.language || 'en';
	
	Account.findOne({user: user}, function(err, account) {
        if (err || !account || md5(user+email, config.key) !== key) { // db error
            if (lang == 'zh-CN') {
                res.send('链接已失效');
            } else { // default 'en'
                res.send('Invalid request.');
            }
            return;
        }
        if(!account.active) {
            if (lang == 'zh-CN') {
                res.send('该账号还没有被激活。');
            } else { // default 'en'
                res.send('This account has not been activated yet.');
            }
            return;
        }
        
        var pswd = md5(new Date(), user).slice(0, 10);
        account.pswd = md5(pswd);
        account.save(function(err) {
            if (err) {
                if (lang == 'zh-CN') {
                    res.send('非常抱歉，系统无法重置该账号的密码。');
                } else { // default 'en'
                    res.send('Sorry, the password of this account could not be reset.');
                }
            } else {
                if (lang == 'zh-CN') {
                    res.send('恭喜，您的新密码是：' + pswd);
                } else { // default 'en'
                    res.send('Success, your new password is: ' + pswd);
                }
            }
        });
    });
};
