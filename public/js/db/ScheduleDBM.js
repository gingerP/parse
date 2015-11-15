var Parent = require('./DBManager');
function ScheduleDBM() {}

ScheduleDBM.prototype = Object.create(Parent.prototype);
ScheduleDBM.prototype.constructor = ScheduleDBM;

ScheduleDBM.prototype.getCollectionName = function() {
    return 'schedules';
};

ScheduleDBM.prototype.list = function(callback) {
    if (typeof(callback) == 'function') {
        this._list(callback);
    }
};

ScheduleDBM.prototype.insert = function(doc, callback) {
    this._insert(doc, callback);
};

ScheduleDBM.prototype.saveEntity = function(doc, callback) {
    this._save(doc, callback);
};

ScheduleDBM.prototype.saveEntities = function(docs, callback) {
    this._saveEntities(docs, callback);
};

ScheduleDBM.prototype.update = function(doc, callback) {
    this._update({
        configCode: {
            $eq: doc.configCode
        }
    }, callback);
};

module.exports = ScheduleDBM;