var GenericDBManager = require('./GenericDBManager').class;
var manager;

ScheduleDBManager = function() {};
ScheduleDBManager.prototype = Object.create(GenericDBManager.prototype);
ScheduleDBManager.prototype.constructor = ScheduleDBManager;

manager = new ScheduleDBManager();
manager.setCollectionName('schedules');
module.exports = {
    class: ScheduleDBManager,
    instance: manager
};
