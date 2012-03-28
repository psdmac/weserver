var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    config = require('../config').config;
    
var server = new Server(config.db_host, config.db_port, {auto_reconnect: true});
var db = new Db(config.db_name, server);

db.open(function(err, db) {
    if (err) {
        console.log('db error: ' + err.message);
        process.exit(1);
    }
    //console.log('connected mongodb://' + config.db_host + ':' + config.db_port + '/' + config.db_name);
});

exports.db = db;
