var DBM = require('./DBManager');
var ConfigDBM = require('./ParseConfigDBManager');
var ScheduleDBM = require('./ScheduleDBM');
var UserDBM = require('./UserDBM');

function InitDBM() {
    this.collections = [
        'parse_configs',
        'parse_data',
        'schedules'
    ];
}

InitDBM.prototype = Object.create(DBM.prototype);
InitDBM.prototype.constructor = InitDBM;

InitDBM.prototype.validate = function(callback) {
    console.info('Begin validation');
    var inst = this;
    this.exec(function(db) {
        inst.validateCollections(db)
            //.initData(db, callback)
    })
};

InitDBM.prototype.validateCollections = function(db) {
    var inst = this;
    db.collections(function(error, collections) {
        var collectionNames = [];
        collections = collections || [];
        collections.forEach(function(collection) {
            collectionNames.push(collection.s.name);
        });
        console.log('Validate collections...');
        inst.collections.forEach(function(name) {
            if (collectionNames.indexOf(name) < 0) {
                db.createCollection(name);
                console.log('Collection "' + name + '" create');
            } else {
                console.log('Collection "' + name + '" exist');
            }
        })
    });
    return this;
};

InitDBM.prototype.initUsers = function() {
    var userDBM = new UserDBM();
    userDBM.create('vinni', '111', function() {});
    userDBM.create('valiart', 'HighAces', function() {});
};

InitDBM.prototype.initData = function(db, callback) {
    var check = function() {
        index--;
        if (index == 0 && typeof(callback) == 'function') {
            callback();
        }
    };
    var configDBM = new ConfigDBM();
    var scheduleDBM = new ScheduleDBM();
    var catalogCfg = require('../../../init/catalog.json');
    var sectionsCfg = require('../../../init/sections.json');
    var schedules = require('../../../init/schedules.json');
    var index = 1 + 1 + schedules.length;

    console.log('Validate init data...');
    configDBM.insert(catalogCfg, check);
    configDBM.insert(sectionsCfg, check);
    schedules.forEach(function(sched) {
        scheduleDBM.insert(sched, check);
    });
    return this;
};
module.exports = InitDBM;
