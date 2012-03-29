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
            feedback.account = account;
            feedback.status = 5;
        }
        socket.emit('wedata', feedback);
    });
};

exports.forget = function(socket, data) {
    console.log('account.forget');
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
        var avatar_url = 'http://www.gravatar.com/avatar/' + md5(data.email) + '?size=48';
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
            mailer.sendActivateMail(data.email, data.user, token, function(err, res) {
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
    res.send('activate');
};
