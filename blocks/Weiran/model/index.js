var mongoose = require('mongoose'),
	config= require('../config').config;
	
mongoose.connect(config.db, function(err){
	if(err){
		console.log('connect to db error: ' + err.message);
		process.exit(1);
	}
});

// models
require('./account');
require('./device');
require('./app');

exports.Account = mongoose.model('Account');
exports.Device = mongoose.model('Device');
exports.App = mongoose.model('App');
