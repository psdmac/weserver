// bridge data with events between tcp, zmq, and db
var EventEmitter = require("events").EventEmitter;
var events = new EventEmitter();

exports.events = events;
