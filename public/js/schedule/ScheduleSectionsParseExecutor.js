var GenericScheduler = require('./GenericScheduler').class;
var parseConfigDBManager = require('../db/ParseConfigDBManager').instance;
var parseDataDBManager = require('../db/ParseDataDBManager').instance;
var scheduleDBManager = require('../db/ScheduleDBManager').instance;
var scheduleStatus = require('../models/ScheduleParseStatus.json');
var utils = require('global').utils;
var log = require('global').log;
/*var steps = [
    require('../ScheduleSectionsParseExecutorSteps/SectionStep').class,
    require('../ScheduleSectionsParseExecutorSteps/SectionNumberStep').class,
    require('../ScheduleSectionsParseExecutorSteps/SectionPageItemStep').class,
    require('../ScheduleSectionsParseExecutorSteps/ItemStep').class,
    require('../ScheduleSectionsParseExecutorSteps/AuthorStep').class
];
var sectionsScheduleExtend = require('../../models/SectionsScheduleExtend.json');*/

ScheduleParseExecutor = function() {};

ScheduleParseExecutor.prototype = Object.create(GenericScheduler.prototype);
ScheduleParseExecutor.prototype.constructor = ScheduleParseExecutor;
ScheduleParseExecutor.prototype.init = function(scheduleId) {
    this.listenerPoints = {
        pageLoadStart: 'page_load_start',
        pageLoadFinish: 'page_load_finish',
        parseStart: 'parse_start',
        parseFinish: 'parse_finish',
        parsedDataSaved: 'parse_data_saved'
    };
    this.configs = {};
    this._scheduleId = scheduleId;
    this.schedule;
    this.parseConfig;
    return this;
};

ScheduleParseExecutor.prototype.start = function() {
    var inst = this;
    return new Promise(function(resolve, reject) {
        if (!inst.schedule) {
            return inst.loadDependencies(inst._scheduleId).then(function() {
                inst.run();
                resolve(true);
            })
        } else {
            inst.run();
            resolve(true);
        }
    });
};

ScheduleParseExecutor.prototype.updateStatus = function(status) {
    if (this.parseConfig) {
        this.schedule.status = status;
    } else {
        log.warn('UpdateStatus. There is now schedule config for schedule executor!');
    }
};

ScheduleParseExecutor.prototype.getExecutor = function() {
    var inst = this;
    return function() {
        inst.run();
        /*inst.propertyChange(inst.listenerPoints.pageLoadStart);
        utils.loadDom(inst.parseConfig.url, function(error, body) {
            var entity;
            var data;
            try {
                inst.propertyChange(inst.listenerPoints.pageLoadFinish);
                data = utils.extractDataFromHtml(body, inst.parseConfig);
                inst.propertyChange(inst.listenerPoints.parseFinish);
                entity = {
                    created: Date.now(),
                    code: inst.parseConfig.code,
                    data: data
                };
                parseDataDBManager.saveByCriteria(entity, {code: inst.parseConfig.code}).then(function (id) {
                    //TODO what if error?
                    log.info('Scheduler "%s" was update data.', inst.getName());
                    inst.propertyChange(inst.listenerPoints.parsedDataSaved);
                });
            } catch(error) {
                log.error(error.message);
            }
        }, 'koi8r');*/
    };
};

ScheduleParseExecutor.prototype.getName = function() {
    return this.schedule.config;
};

ScheduleParseExecutor.prototype.loadDependencies = function(scheduleId) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        scheduleDBManager
            .get(scheduleId)
            .then(function (scheduleEntity) {
                    inst.schedule = scheduleEntity;
                    return parseConfigDBManager.getByCriteria({code: inst.schedule.config});
                }, function(rejectObject) {
                    reject(rejectObject);
                    //TODO implement
                })
            .catch(function (error) {
                    log.error(error.getMessage());
                })
            .then(function (config) {
                inst.parseConfig = config;
                resolve(true);
            });
    })
};

ScheduleParseExecutor.prototype.run = function(schedule, extend) {
    var inst = this;
    var destIndex = this._getStepIndex(extend.stepCode);
    destIndex = utils.hasContent(destIndex)? destIndex: 0;
    return new Promise(function(resolve) {
        inst._run(schedule, 0, null, destIndex);
        resolve();
    })
};

ScheduleParseExecutor.prototype._run = function(schedule, index, prevStepRes, destIndex) {
    var stepCode;
    var inst = this;
    if (index >= steps.length) {
        return;
    }
    stepCode = this._getHandlerByIndex(index, schedule);
    if (stepCode) {
        stepCode = stepCode.code;
        (Array.isArray(prevStepRes)
            ? prevStepRes
            : [prevStepRes])
            .forEach(function (prevResult) {
                new steps[index]().run(inst.getStepDependenciesCallback(schedule, stepCode, prevResult)).then(function (result) {
                    if (index < destIndex) {
                        inst._run(schedule, index + 1, result);
                    }
                });
            });
    }
};

//TODO refactoring
ScheduleParseExecutor.prototype._getHandler = function(stepCode, schedule) {
    var index = 0;
    while(index  < schedule.extend.handlers.length) {
        if (schedule.extend.handlers[index].code === stepCode) {
            return schedule.extend.handlers[index];
        }
        index++;
    }
};

//TODO refactoring
ScheduleParseExecutor.prototype._getHandlerByIndex = function(index, schedule) {
    return schedule.extend && schedule.extend.handlers && schedule.extend.handlers.length > index? schedule.extend.handlers[index]: null;
};

//TODO refactoring
ScheduleParseExecutor.prototype._getConfigCode = function(stepCode, schedule) {
    var index = 0;
    while(index  < schedule.extend.handlers.length) {
        if (schedule.extend.handlers[index].code === stepCode) {
            return schedule.extend.handlers[index].config;
        }
        index++;
    }
};

//TODO refactoring
ScheduleParseExecutor.prototype._getStepIndex = function(stepCode) {
    var index = 0;
    while (index < sectionsScheduleExtend.handlers.length) {
        if (sectionsScheduleExtend.handlers[index].code === stepCode) {
            return index;
        }
        index++;
    }
};

module.exports = {
    class: ScheduleParseExecutor
};