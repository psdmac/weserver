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

exports.Account = mongoose.model('Account');
