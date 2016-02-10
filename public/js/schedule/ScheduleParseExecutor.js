var GenericScheduler = require('./GenericScheduler').class;
var parseConfigDBManager = require('../db/ParseConfigDBManager').instance;
var parseDataDBManager = require('../db/ParseDataDBManager').instance;
var scheduleDBManager = require('../db/ScheduleDBManager').instance;
var scheduleStatus = require('../models/ScheduleParseStatus.json');
var utils = require('global').utils;
var log = require('global').log;

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
                inst.getCronInstance().start();
                inst.getExecutor()();
                log.info('Scheduler "%s" started!', inst.getName());
                resolve(true);
            })
        } else {
            inst.getCronInstance().start();
            inst.getExecutor()();
            log.info('Scheduler "%s" started!', inst.getName());
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
        inst.propertyChange(inst.listenerPoints.pageLoadStart);
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
        }, 'koi8r');
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

module.exports = {
    class: ScheduleParseExecutor
};