var config = require('./config').config;

console.log('GM901');
console.log('Starts at %s in %s mode', new Date().toISOString(), process.env.NODE_ENV || 'development');

// start tcp service
var tcp = require('./lib/tcp');
tcp.start(config.tcp_port, config.tcp_timeout, config.tcp_keepalive);

