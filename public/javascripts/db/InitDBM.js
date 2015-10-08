var DBM = require('./DBManager');
var ConfigDBM = require('./ParseConfigDBManager');
var catalogCfg = require('../dataConfigs/catalog.json');
var sectionsCfg = require('../dataConfigs/sections.json');
function InitDBM() {
    this.collections = [
        'parse_configs',
        'parse_data',
        'schedules'
    ];
}

InitDBM.prototype = Object.create(DBM.prototype);
InitDBM.prototype.constructor = InitDBM;

InitDBM.prototype.validate = function() {
    console.info('Begin validation');
    var inst = this;
    this.exec(function(db) {
        inst.validateCollections(db)
            //.initConfigs(db)
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

InitDBM.prototype.initConfigs = function(db) {
    console.log('Validate init data...');
    var configDBM = new ConfigDBM();
    configDBM.update(catalogCfg);
    configDBM.update(sectionsCfg);
    return this;
};
module.exports = InitDBM;
