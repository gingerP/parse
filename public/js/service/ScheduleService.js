var utils = require('../utils');
var scheduleStatus = require('../models/ScheduleParseStatus.json');
var c = require('../constants');
var scheduleDBManager = require('../db/ScheduleDBManager').instance;
var configDBManager = require('../db/ParseConfigDBManager').instance;
var GenericService = require('./GenericService').class;
var ScheduleParseExecutor = require('../schedule/ScheduleSectionsParseExecutor').class;
var cron = require('cron');
var fs = require('fs');
var service;

scheduleDBManager.addListener('remove', function(removeResult, id) {
    if (service.tasks[id]) {
        service.tasks[id].stop().then(function() {
            delete service.tasks[id];
        });
    }
}, true);

function scheduleListener() {

}

ScheduleService = function() {
    this.tasks = {}
};

ScheduleService.prototype = Object.create(GenericService.prototype);
ScheduleService.prototype.constructor = ScheduleService;

ScheduleService.prototype.start = function(id) {
    var inst = this;
    if (!this.tasks[id]) {
        this.tasks[id] = new ScheduleParseExecutor().init(id);
        this.tasks[id].addListener('parse', scheduleListener, true);
        inst._initScheduleListeners(this.tasks[id]);
        return this.tasks[id].start().then(function() {
            return inst.updateStatus(id, scheduleStatus.PERFORMED);
        });
    } else {
        return this.tasks[id].start().then(function() {
            return inst.updateStatus(id, scheduleStatus.PERFORMED);
        });
    }
};

ScheduleService.prototype.stop = function(id) {
    var inst = this;
    return new Promise(function(resolve) {
        if (inst.tasks[id]) {
            inst.tasks[id].stop().then(function() {
                inst.updateStatus(id, scheduleStatus.STOPPED).then(function() {
                    resolve(true);
                });
            });
        }
        resolve(true);
    });
};

ScheduleService.prototype.restart = function(id) {
    var inst = this;
    if (inst.tasks[id]) {
        return new Promise(function(resolve, reject) {
            inst.tasks[id].restart().then(function() {
                inst.updateStatus(id, scheduleStatus.PERFORMED).then(function() {
                    resolve(true);
                });
            });
        });
    } else {
        return inst.start(id).then(function() {
            return inst.updateStatus(id, scheduleStatus.PERFORMED);
        });
    }
};

ScheduleService.prototype.save = function(doc, mappings) {
    var inst = this;
    if (!utils.hasContent(doc.status) && (!mappings || utils.getMappingsItemByProperty(mappings, 'status'))) {
        doc.status = scheduleStatus.STOPPED;
    }
    return new Promise(function(resolve, reject) {
        inst.manager.save(doc, mappings).then(function(value) {
            resolve(value);
        })
    });
};

ScheduleService.prototype.updateStatus = function(id, status) {
    if (scheduleStatus.hasOwnProperty(status)) {
        return this.manager.save({_id: id, status: status}, [
            {property: 'status', input: 'status'}
        ]);
    } else {
        console.error('%s: Status "%s" DIDN\'T exist in ScheduleStatus(%s).', Date(Date.now()), status, JSON.stringify(scheduleStatus));
        return new Promise(function(resolve, reject) {
            reject();
        })
    }
};

ScheduleService.prototype.getScheduleExecutorsList = function() {
    return new Promise(function(resolve, reject) {
        resolve([
            {code: "ScheduleSectionsParseExecutor", extendConfig: true},
            {code: "ScheduleParseExecutor", extendConfig: false}
        ]);
    });
};

ScheduleService.prototype.validateCron = function(cronString) {
    return new Promise(function(resolve, reject) {
        //if we get an error - cron is not valid
        new cron.CronTime(cronString);
        resolve(true);
    });
};

ScheduleService.prototype._getScheduleExecutor = function(type) {

};

ScheduleService.prototype._initScheduleListeners = function(task) {
    task.addListener(task.listenerPoints.pageLoadStart, scheduleListener, true);
    task.addListener(task.listenerPoints.pageLoadFinish, scheduleListener, true);
    task.addListener(task.listenerPoints.parseStart, scheduleListener, true);
    task.addListener(task.listenerPoints.parseFinish, scheduleListener, true);
    task.addListener(task.listenerPoints.parsedDataSaved, scheduleListener, true);
};

service = new ScheduleService();
service.setManager(scheduleDBManager);

module.exports = {
    class: ScheduleService,
    instance: service
};
