var u = require('../utils');
var c = require('../constants');
var scheduleDBManager = require('../db/ScheduleDBManager').instance;
var configDBManager = require('../db/ParseConfigDBManager').instance;
var GenericService = require('./GenericService').class;
var ScheduleParseExecutor = require('../schedule/ScheduleParseExecutor').class;
var cron = require('cron');

ScheduleService = function() {
    this.tasks = {}
};
ScheduleService.prototype = Object.create(GenericService.prototype);
ScheduleService.prototype.constructor = ScheduleService;
ScheduleService.prototype.start = function(id) {
    if (!this.tasks[id]) {
        this.tasks[id] = new ScheduleParseExecutor().init(schedule, config);
        return this.tasks[id].start();
    } else {
        return this.tasks[id].start();
    }
};
ScheduleService.prototype.stop = function(id) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        if (inst.tasks[id]) {
            inst.tasks[id].stop();
        }
        resolve(true);
    });
};
ScheduleService.prototype.restart = function(id) {
    var inst = this;
    if (inst.tasks[id]) {
        return new Promise(function(resolve, reject) {
            inst.tasks[id].restart();
            resolve(true);
        });
    } else {
        return inst.start(id);
    }
};

ScheduleService.prototype.validateCron = function(cronString) {
    return new Promise(function(resolve, reject) {
        //if we get an error - cron is not valid
        new cron.CronTime(cronString);
        resolve(true);
    });
};
service = new ScheduleService();
service.setManager(scheduleDBManager);

module.exports = {
    class: ScheduleService,
    instance: service
};
