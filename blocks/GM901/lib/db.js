var mongoskin = require('mongoskin');
var xx = require("./xx");
var db;

// entry
exports.start = function(db) {
    db = mongoskin.db(db);
    console.log("%d - Starts to open database %s", Date.now(), db);
};

var coIndexes = {}; // {co_key: true}

// store device data
xx.events.on('gm901', function(gm901) {
    // just valid pvt data can be stored
    if (!db) {
        return;
    }
    if (gm901.type !== 0x12 || gm901.type !== 0x16) { // not pvt data
        return;
    }
    if (gm901.gps !== 1) { // invalid pvt
        return
    }
    
    var coName = 'co_' + gm901.key;
    var item = null;
    
    if (gm901.type === 0x12 && gm901.gps === 1) { // valid gps
        item = {
            time: gm901.time,
            lonlat: [gm901.lon, gm901.lat],
            speed: gm901.speed,
            course: gm901.course
        };
    } else if (gm901.type === 0x13) { // status
        item = {
            time: gm901.time,
            defence: gm901.defence,
            acc: gm901.acc,
            charging: gm901.charging,
            alarm: gm901.alarm,
            gps: gm901.gps,
            oil: gm901.oil,
            voltage: gm901.voltage,
            gsm: gm901.gsm
        };
    } else if (gm901.type === 0x16) { // gps & status
        item = {
            time: gm901.time,
            defence: gm901.defence,
            acc: gm901.acc,
            charging: gm901.charging,
            alarm: gm901.alarm,
            gps: gm901.gps,
            oil: gm901.oil,
            voltage: gm901.voltage,
            gsm: gm901.gsm
        };
        if (gm901.gps === 1) {
            item.lonlat = [gm901.lon, gm901.lat];
            item.speed = gm901.speed;
            item.course = gm901.course;
        }
    }
    
    if (item) {
        db.collection(coName).insert(item, function(error) {
            if (error) {
                console.log('%d - DB error: %j', Date.now(), error);
            }
        });
    
        // ensure indexes
        if (!coIndexes[coName]) {
            coIndexes[coName] = true;
            db.collection(coName).ensureIndex({time: 1});
        };
    }
});

// store commands
xx.events.on('command', function(cmd) {
    var coName = 'co_commands';
    
    db.collection(coName).insert({
        key: cmd.key,
        mark: cmd.mark,
        command: cmd.command,
        response: ''
    }, function(error) {
        if (error) {
            console.log('%d - DB error: %j', Date.now(), error);
        }
    });
    
    // ensure indexes
    if (!coIndexes[coName]) {
        coIndexes[coName] = true;
        db.collection(coName).ensureIndex({key: 1});
    }
});

// query device data
exports.find = function(key, t0, t1, callback) {
    db.collection('co_' + key).find({
        time: {$gte: t0, $lte: t1}
    }).toArray(function(error, result) {
        if (error) {
            callback([]);
            console.log('%d - DB error: %j', Date.now(), error);
        } else {
            callback(result);
        }
    });
};

