var mongoose = require('mongoose');

mongoose.model('App', new mongoose.Schema({
	name: {type: String, lowercase: true, index: true},
	description: {},                        // {en: html, zh-CN: html}
	price: {type: Number, default: 0},
	users: {type: Number, default: 0},
	type: String,                           // class name
	options: {}                             // {}
}));
