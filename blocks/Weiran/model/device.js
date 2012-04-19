var mongoose = require('mongoose');

mongoose.model('Device', new mongoose.Schema({
	used: {type: Boolean, default: false},
	user: String,
	type: String,       // class name
	opts: {}            // options for class
}));
