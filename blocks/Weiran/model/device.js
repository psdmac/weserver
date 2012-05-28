var mongoose = require('mongoose');

mongoose.model('Device', new mongoose.Schema({
    model: {type: String, uppercase: true, index: true},
	used: {type: Boolean, default: false},
	user: String,
	used_at: {type: Date, default: Date.now},
	type: String,       // class name
	opts: {}            // options for frount-class
}));
