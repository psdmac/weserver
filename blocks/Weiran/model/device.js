var mongoose = require('mongoose');

mongoose.model('Device', new mongoose.Schema({
    sn: {type: String, lowercase: true, index: true},
    model: {type: String, uppercase: true},
    created_by: String,
    updated_by: String,
    updated_at: Date,
	used: {type: Boolean, default: false},
	user: String,
	used_at: Date,
	type: String,       // subclass name
	opts: {}            // options for frount-class
}));
