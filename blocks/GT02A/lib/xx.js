// bridge data with events between tcp, ws, and db
var events = new require("events").EventEmitter();
exports.events = events;
