// bridge data with events between tcp, ws, and db
var EventEmitter = require("events").EventEmitter;
var events = new EventEmitter();

exports.events = events;
