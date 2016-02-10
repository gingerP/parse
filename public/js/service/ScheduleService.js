var utils = require('global').utils;
var log = require('global').log;
var scheduleStatus = require('../models/ScheduleParseStatus.json');
var c = require('../constants');
var scheduleDBManager = require('../db/ScheduleDBManager').instance;
var configDBManager = require('../db/ParseConfigDBManager').instance;
var GenericService = require('./GenericService').class;
var ScheduleParseExecutor = require('../schedule/ScheduleSectionsParseExecutor').class;
var cron = require('cron');
var fs = require('fs');
var service;
var schedulersExtends = [
    {
        name: 'ScheduleSectionsParseExecutor',
        testClass: require('../schedule/test/ScheduleSectionsParseExecutorTest').class,
        class: require('../schedule/ScheduleSectionsParseExecutor').class,
        extend: require('../models/SectionsScheduleExtend.json')
    },
    {
        name: 'ScheduleSectionsParseExecutor',
        testClass: require('../schedule/test/ScheduleSectionsParseExecutorTest').class,
        class: require('../schedule/ScheduleSectionsParseExecutor').class,
        extend: require('../models/SectionsScheduleExtend.json')
    },
    {
        name: 'ScheduleParseExecutor',
        testClass: require('../schedule/test/ScheduleParseExecutorTest').class,
        class: require('../schedule/ScheduleParseExecutor').class,
        extend: require('../models/ScheduleExtend.json')
    }
];

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
    return this.get(id).then(function(schedule) {
        var executor;
        if (!inst.tasks[id]) {
            executor = inst._getScheduleExecutor(schedule);
            inst.tasks[id] = new executor.class().init(id);
            inst.tasks[id].addListener('parse', scheduleListener, true);
            inst._initScheduleListeners(inst.tasks[id]);
            return inst.tasks[id].start().then(function() {
                return inst.updateStatus(id, scheduleStatus.PERFORMED);
            });
        } else {
            return inst.tasks[id].start().then(function() {
                return inst.updateStatus(id, scheduleStatus.PERFORMED);
            });
        }
    });
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
        log.error('Status "%s" DIDN\'T exist in ScheduleStatus(%s).', status, JSON.stringify(scheduleStatus));
        return new Promise(function(resolve, reject) {
            reject();
        })
    }
};

ScheduleService.prototype.getScheduleExecutorsList = function() {
    return new Promise(function(resolve, reject) {
        resolve(schedulersExtends.map(function(item) {
            return item.extend;
        }));
    });
};

ScheduleService.prototype.validateCron = function(cronString) {
    return new Promise(function(resolve, reject) {
        //if we get an error - cron is not valid
        new cron.CronTime(cronString);
        resolve(true);
    });
};

ScheduleService.prototype.test = function(schedule, extend) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        var executor = inst._getScheduleExecutor(schedule);
        if (executor) {
            new executor.testClass().run(schedule, extend).then(function(result) {
                resolve(result);
            }, reject);
        } else {
            resolve(true);
        }
    })
};

ScheduleService.prototype._getScheduleExecutor = function(schedule) {
    var index = 0;
    while(index <= schedulersExtends.length) {
        if (schedulersExtends[index].name === schedule.extend.code) {
            return schedulersExtends[index];
        }
        index++;
    }
};

ScheduleService.prototype.getNew = function() {
    return new Promise(function(resolve, reject) {

    });
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
