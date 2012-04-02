var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
var AccountSchema = new Schema({
	user: {type: String, index: true},
	pswd: {type: String},
	email: {type: String},
	create_at: {type: Date, default: Date.now},
	update_at: {type: Date, default: Date.now},
	active: {type: Boolean, default: false},
	pswd_reset: {type: Boolean, default: true},
	signin_at: {type: Date, default: Date.now}, // update on signing in
	signin_count: {type: Number, default: 0}, // update on signing in
	token: {type: String}, // update on signing in
	level: {type: Number, default: 0},
	apps: {type: Array}, // [{}]
	devices: {type: Array}, // [{}]
	layers: {type: Array}, // [{}]
	features: {type: Array} // [{}]
});

mongoose.model('Account', AccountSchema);
