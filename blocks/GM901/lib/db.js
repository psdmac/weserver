var mongoskin = require('mongoskin');
var xx = require("./xx");
var db;

// entry
exports.start = function(db) {
    db = mongoskin.db(db);
    console.log("%d - Starts to connect database %s", Date.now(), db);
};

var coIndexes = {}; // {co_key: true}

// store device data
xx.events.on('gt02a', function(gt02a) {
    // just valid pvt data can be stored
    if (gt02a.protocol !== 0x10 || gt02a.stgps !== 1 || !db) {
        return;
    }
    
    var coName = 'co_' + gt02a.key;
    
    db.collection(coName).insert({
        time: gt02a.time,
        count: gt02a.count,
        lonlat: [gt02a.longitude, gt02a.latitude],
        angle: gt02a.course,
        speed: gt02a.velocity,
        stgps: gt02a.stgps,
        stpow: gt02a.stpow,
        stsos: gt02a.stsos,
        stoff: gt02a.stoff
    }, function(error) {
        if (error) {
            console.log('%d - DB error: %j', Date.now(), error);
        }
    })
    
    // ensure indexes
    if (!coIndexes[coName]) {
        coIndexes[coName] = true;
        db.collection(coName).ensureIndex({time: 1});
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

