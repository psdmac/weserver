var mongoose = require('mongoose');

mongoose.model('Account', new mongoose.Schema({
	user: {type: String, index: true},
	pswd: {type: String},
	email: {type: String},
	update_at: {type: Date, default: Date.now},
	active: {type: Boolean, default: false},
	pswd_reset: {type: Boolean, default: true},
	signin_at: {type: Date, default: Date.now},     // update on signing in
	signin_count: {type: Number, default: 0},       // update on signing in
	token: {type: String},                          // update on signing in
	level: {type: Number, default: 0},
	apps: [{}],                                     // [{}]
	devices: [{}],                                  // [{}]
	layers: [{}],                                   // [{}]
	features: [{}]                                  // [{}]
}));
