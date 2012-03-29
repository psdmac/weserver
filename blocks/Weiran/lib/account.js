var Account = require('../model').Account,
    md5 = require('./md5').md5;

exports.signin = function(socket, data) {
    var feedback = {
        type: data.type,
        status: 0
    };

    // processing
    socket.emit('wedata', feedback);
    
    db.collection('account', function(err, collection) {
        // db error
        if (err) {
            console.log('db error: ' + err.message);
            feedback.status = 1;
            socket.emit('wedata', feedback);
            return;
        }
        collection.findOne({user: data.user, pswd: data.pswd}, function(err, doc) {
            // db error
            if (err) {
                console.log('db error: ' + err.message);
                feedback.status = 2;
                socket.emit('wedata', feedback);
                return;
            }
            
            // not found
            if (!doc || doc.length<1) {
                feedback.status = 3;
                socket.emit('wedata', feedback);
                return;
            }
            
            // ok
            feedback.account = doc;
            feedback.status = 4;
            socket.emit('wedata', feedback);
        });
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
    
    Account.find({'$or':[{'user': data.user}, {'email':data.email}]}, function(err, accouts) {
        if(err) { // db error
            console.log('db error: ' + err.message);
            feedback.status = 1;
            socket.emit('wedata', feedback);
            return;
        }
        if(users.length > 0) {
            // user / email using
            feedback.status = 1;
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
                feedback.status = 2;
                socket.emit('wedata', feedback);
                return;
            }
            // send a mail
        });
    });
    
    db.collection('account', function(err, collection) {
        // db error
        if (err) {
            console.log('db error: ' + err.message);
            feedback.status = 1;
            socket.emit('wedata', feedback);
            return;
        }
        collection.findOne({user: data.user, pswd: data.pswd}, function(err, doc) {
            // db error
            if (err) {
                console.log('db error: ' + err.message);
                feedback.status = 2;
                socket.emit('wedata', feedback);
                return;
            }
            
            // not found
            if (!doc || doc.length<1) {
                feedback.status = 3;
                socket.emit('wedata', feedback);
                return;
            }
            
            // ok
            feedback.account = doc;
            feedback.status = 4;
            socket.emit('wedata', feedback);
        });
    });
};

exports.update = function(socket, data) {
    console.log('account.update');
};
