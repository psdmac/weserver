// WeAccount.js is a part of Weiran server suites.
// Tian Yantao (yantaotian@foxmail.com)
// V11.11

var weConfig = require('/usr/local/etc/WeAccount.conf'),
    util = require('util'),
    sio = require('/usr/local/lib/node_modules/socket.io'),
    mysql = require('/usr/local/lib/node_modules/db-mysql');

// initialize mysql connection with configurations
var myconn = new mysql.Database({
    hostname: weConfig.dbhost,
    port: weConfig.dbport,
    user: weConfig.dbuser,
    password: weConfig.dbpswd,
    database: weConfig.dbname,
    charset: weConfig.charset
});

// try to conncet server
myconn.connect();

myconn.on('error', function(err) {
    util.log(err);
});

myconn.on('ready', function(){
    util.log('connected to mysql: ' +weConfig.dbhost + ':' + weConfig.dbport);
});

// start web socket server
sio = sio.listen(weConfig.wsport);
util.log('listen port: ' + weConfig.wsport);

// configuration for web socket server
sio.enable('browser client minification');  // send minified client
sio.enable('browser client etag');          // apply etag caching logic based on version number
sio.set('log level', 2);                    // reduce logging
sio.set('transports', [                     // enable all transports (optional if you want flashsocket)
    'websocket', 
    'flashsocket', 
    'htmlfile', 
    'xhr-polling', 
    'jsonp-polling'
]);

// map of socket id and client position
mapSockIdPos = {};
// map of account email and socket id
mapEmailSockId = {};

// web socket event handlers
sio.sockets.on('connection', function (socket) {
    // broadcast to all cients that I'm online
    socket.broadcast.emit('clientonline', socket.id);
    //util.log('broadcast online of ' + socket.id);
    
    // send all client positions to this socket
    socket.emit('clientspos', mapSockIdPos);
    //util.log('emit clientspos to ' + socket.id);
    
    // disconnect event handler
    socket.on('disconnect', function () {
        // remove item from socket-pos map
        if ( mapSockIdPos[socket.id]) {
            delete mapSockIdPos[socket.id];
            //util.log('del < mapSockIdPos.' + socket.id);
        }
        // remove item from email-socket map if exists
        if ( socket.email && mapEmailSockId[socket.email] ) {
            delete mapEmailSockId[socket.email];
            socket.email = null;
            //util.log('del < mapEmailSockId.' + socket.email);
        }
        
        // broadcast to all clients that I'm offline
        socket.broadcast.emit('clientoffline', socket.id);
        //util.log('broadcast offline of ' + socket.id);
    });
    
    // broadcast message to all clients
    socket.on('broadcastmsg', function(msg) {
        socket.broadcast.emit('broadcastmsg', socket.id, msg);
    });
    
    // sign in event handler
    socket.on('signin', function (email, passwd) {
        // email is the email address of user who are trying to sign in
        // passwd is a md5 value of the password string the user registed with
        
        // check status of database connection
        if (!myconn.isConnected()) {
            socket.emit('error', 'Lost DB host, please try again later.');
            return;
        }
       
        myconn.query().select('*').from('account').where('`email` = ?', [email]).limit(1).
        execute(function(err, rows, cols) {
            if (err) {
                socket.emit('error', err);
                return;
            }
            
            if (rows.length === 0) {
                socket.emit('error', 'Not registed email address');
            } else if (rows[0].passwd !== passwd) {
                socket.emit('error', 'Not registed email address or invalid password');
            } else { // access
                var user = {
                    email: rows[0]['email'],
                    tlast: rows[0]['tlast'],
                    plast: rows[0]['plast'],
                    name: rows[0]['name']
                }
                socket.emit('access', user);
                // set a email property to find socket by email
                socket.email = email;
                mapEmailSockId[email] = socket.id;
            }
        });
    }); // end of signin event
    
    // update clients position
    socket.on('updatepos', function(pos) {
        //util.log('on updatepos of ' + socket.id);
        if (typeof pos === 'object' && typeof pos.longitude !== 'undefined') {
            mapSockIdPos[socket.id] = pos;
        }
        // broadcast this update to other clients
        socket.broadcast.emit('clientnewpos', socket.id, pos);
        //util.log('broadcast new pos of ' + socket.id);
        
        /*if (typeof pos !== 'object') {
            socket.emit('error', 'Invalid position data');
            return;
        }
        // check status of database connection
        if (!myconn.isConnected()) {
            socket.emit('error', 'Lost DB host, please try again later.');
            return;
        }
        // update last signing info
        myconn.query().update('account').set({
            'tlast': new Date(),
            'plast': JSON.stringify(pos)
        }).where('`email` = ?', [email]).execute(function(err, res) {
            if (err) {
                util.log('error: ' + err);
                return;
            }
        });*/
    });
    
    // register event
    socket.on('create', function(email, passwd) {
        myconn.query().insert(
            'account',
            ['email', 'passwd', 'tadd'],
            [email, passwd, new Date()]
        ).execute(function(err, res) {
            if (err) {
                if (err.toLowerCase().indexOf('duplicate') >=0 ) {
                    socket.emit('error', 'Please try another email address');
                } else {
                    util.log('error: ' + err);
                }
                return;
            }
            // ok
            var user = {
                email: email
            }
            socket.emit('access', user);
        });
    }); // end of register event
    
    // update account info
    socket.on('update', function(account) {
    });
});
