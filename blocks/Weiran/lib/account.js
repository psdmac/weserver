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
            socket.emit('wedata', feedback);
            console.log('db error: ' + JSON.stringify(err));
            return;
        }
        if(!account) { // not found
            feedback.status = 2;
            socket.emit('wedata', feedback);
            return;
        }
        if (data.pswd !== account.pswd) {
            feedback.status = 3;
            socket.emit('wedata', feedback);
            return;
        }
        if (!account.active) {
            feedback.status = 4;
            socket.emit('wedata', feedback);
            return;
        }
        // create a token for session
        var time = new Date();
        var token = md5(account.pswd + time.toISOString(), config.key);
        account.signin_at = time;
        account.signin_count += 1;
        account.token = token;
        account.save(function(err) {
            if (err) { // db error
                feedback.status = 5;
            } else { // ok
                feedback.status = 6;
                feedback.account = {
                    user: account.user,
                    email: account.email,
                    token: account.token,
                    money: account.money,
                    apps: account.apps,
                    devices: account.devices,
                    layers: account.layers,
                    features: account.features
                };
            }
            socket.emit('wedata', feedback);
        });
    });
};

exports.logout = function(socket, data) {
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
        // create a token for session
        var time = new Date();
        account.token = md5(account.pswd + time.toISOString(), config.key);
        account.save(function(err) {
            if (err) { // db error
                feedback.status = 5;
            } else { // ok
                feedback.status = 6;
            }
            socket.emit('wedata', feedback);
        });
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
            socket.emit('wedata', feedback);
            console.log('db error: ' + JSON.stringify(err));
            return;
        }
        if(!account) { // not found
            feedback.status = 2;
            socket.emit('wedata', feedback);
            return;
        }
        if (data.email !== account.email) {
            feedback.status = 3;
            socket.emit('wedata', feedback);
            return;
        }
        if (!account.active) {
            feedback.status = 4;
            socket.emit('wedata', feedback);
            return;
        }
        
        // ok, send a mail to reset password
        var token = md5(data.user + data.email, config.key);
        mailer.sendForgetMail(data.email, data.user, token, data.lang, function(err, res) {
            if (err) { // mailer error
                feedback.status = 5;
                socket.emit('wedata', feedback);
                console.log('mailer error: ' + JSON.stringify(err));
                return;
            }
            
            // make sure the password is reset once by the mail
            account.pswd_reset = false;
            account.save(function(err) {
                if (err) { // db error
                    feedback.status = 6;
                } else { // ok
                    feedback.status = 7;
                }
                socket.emit('wedata', feedback);
            });
        });
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
        
        var account = new Account();
        account.user = data.user;
        account.pswd = data.pswd;
        account.email = data.email;
        account.active = false;
        
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
        
        // ok, update password
        account.pswd = data.pswd;
        account.update_at = new Date();
        account.save(function(err) {
            if (err) { // db error
                feedback.status = 5;
                console.log('db error: ' + JSON.stringify(err));
            } else {
                feedback.status = 6;
            }
            socket.emit('wedata', feedback);
        });
        // send a notification mail
        mailer.sendUpdateMail(account.email, data.user, data.lang, function(err, res) {
            if (err) { // mailer error
                console.log('mailer error: ' + JSON.stringify(err));
            }
        });
    });
};

exports.activateAccount = function(req, res) {
    var user = req.query.user,
	    email = req.query.email,
	    lang = req.query.lang,
	    key = req.query.key,
	    time = req.query.time;
	
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
                res.send('该用户已经被激活。');
            } else { // default 'en'
                res.send('This account is already activated.');
            }
            return;
        }
        
        account.active = true;
        account.update_at = new Date();
        account.save(function(err) {
            if (err) {
                if (lang == 'zh-CN') {
                    res.send('非常抱歉，系统无法激活该用户。');
                } else { // default 'en'
                    res.send('Sorry, this account could not be activated.');
                }
            } else {
                if (lang == 'zh-CN') {
                    res.send('恭喜，您现在可以使用该用户登录系统了。');
                } else { // default 'en'
                    res.send('Success, now you can sign in to system with this account.');
                }
            }
        });
    });
};

exports.resetPassword = function(req, res) {
    var user = req.query.user,
	    email = req.query.email,
	    lang = req.query.lang,
	    key = req.query.key,
	    time = req.query.time;
	
	Account.findOne({user: user}, function(err, account) {
        if (err || !account || account.pswd_reset || md5(user+email, config.key) !== key) {
            if (lang == 'zh-CN') {
                res.send('链接已失效');
            } else { // default 'en'
                res.send('Invalid request.');
            }
            return;
        }
        if(!account.active) {
            if (lang == 'zh-CN') {
                res.send('该用户还没有被激活。');
            } else { // default 'en'
                res.send('This account has not been activated yet.');
            }
            return;
        }
        
        // make sure the password is reset once by the mail
        var pswd = md5(new Date(), user).slice(0, 10);
        account.pswd = md5(pswd);
        account.pswd_reset = true;
        account.update_at = new Date();
        account.save(function(err) {
            if (err) {
                if (lang == 'zh-CN') {
                    res.send('非常抱歉，系统无法重置该用户的密码。');
                } else { // default 'en'
                    res.send('Sorry, the password of this account could not be reset.');
                }
            } else {
                if (lang == 'zh-CN') {
                    res.send('恭喜，您的新密码是：' + pswd + '。为安全起见，我们强烈建议您马上登录系统并设置一个新密码。');
                } else { // default 'en'
                    res.send('Success, your new password is: ' + pswd +
                    '. For security, we strongly suggest you signing in to system to set a new password immediately.');
                }
            }
        });
    });
};

exports.validateAdmin = function(req, res) {
    req.session.validated = false;
    
    var admin = req.body.admin;
    if (!admin) {
        res.send('error: 1');
        return;
    }
    
    var admins = config.admins.split(','), found = false;
    for (var i=0, len=admins.length; i<len; i++) {
        if (admin === md5(admins[i])) {
            found = true;
            break;
        }
    }
    if (found) {
        res.send('ok');
        req.session.validated = true;
    } else {
        res.send('error: 2');
    }
};
