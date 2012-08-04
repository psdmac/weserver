var config = require('./config').config;

console.log('GM901');
console.log('Starts at %s in %s mode', new Date().toISOString(), process.env.NODE_ENV || 'development');

// start to connect database
var db = require('./lib/db');
db.start(config.db);

// start tcp service
var tcp = require('./lib/tcp');
tcp.start(config.tcp_port, config.tcp_timeout, config.tcp_keepalive);

// start to communicate with central server
var zmq = require('./lib/zmq');
zmq.start(config.cs_pub, config.cs_pull, config.cs_filter);

