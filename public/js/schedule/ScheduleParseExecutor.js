var GenericScheduler = require('./GenericScheduler').class;
var parseConfigDBManager = require('../db/ParseConfigDBManager').instance;
var parseDataDBManager = require('../db/ParseDataDBManager').instance;
var scheduleDBManager = require('../db/ScheduleDBManager').instance;
var scheduleStatus = require('../models/ScheduleParseStatus.json');
var utils = require('../utils');

ScheduleParseExecutor = function() {};

ScheduleParseExecutor.prototype = Object.create(GenericScheduler.prototype);
ScheduleParseExecutor.prototype.constructor = ScheduleParseExecutor;
ScheduleParseExecutor.prototype.init = function(scheduleId) {
    this.isDependenciesReady = false;
    this.schedule;
    this.scheduleConfig;
    this.setPeriod(this.schedule.cron);
    return this;
};
ScheduleParseExecutor.prototype.setScheduleConfig = function(config) {
    this.scheduleConfig = config;
    return this;
};
ScheduleParseExecutor.prototype.addParseListener = function(type, listener) {
    this.parseListeners = this.parseListeners || {};
    if (typeof(listener) === 'function') {
        this.parseListeners[type] = this.parseListeners[type] || [];
        this.parseListeners[type].push(listener);
    }
    return this;
};
ScheduleParseExecutor.prototype.propertyChange = function(type, data) {
    if (this.parseListeners && this.parseListeners[type] && this.parseListeners[type].length) {
        this.parseListeners[type].forEach(function(listener) {
            listener(data);
        });
    }
    return this;
};

ScheduleParseExecutor.prototype.updateStatus = function(status) {
    if (this.scheduleConfig) {
        this.schedule.status = status;


    } else {
        console.warn('UpdateStatus. There is now schedule config for schedule executor!');
    }
};

ScheduleParseExecutor.prototype.getExecutor = function() {
    var inst = this;
    return function() {
        inst.propertyChange('page_load_start');
        utils.loadDom(inst.schedule.url, function(error, body) {
            var entity;
            var data;
            inst.propertyChange('page_load_finish');
            data = u.extractDataFromHtml(body, inst.scheduleConfig);
            inst.propertyChange('parse_finish');
            entity = {
                code: inst.scheduleConfig.config,
                data: data
            };
            parseDataDBManager.saveByCriteria(entity, {code: inst.scheduleConfig.config}).then(function(id) {
                //TODO what if error?
                inst.propertyChange('parse_data_saved');
            });
        }, 'koi8r');
    };
};

ScheduleParseExecutor.prototype.getName = function() {
    return this.schedule.config;
};

ScheduleParseExecutor.prototype.loadDependencies = function(scheduleId) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        scheduleDBManager.get(scheduleId).then(function (scheduleEntity) {
            inst.schedule = scheduleEntity;
            return parseConfigDBManager.getByCriteria({code: schedule.config});
        }, function(rejectObject) {
            reject(rejectObject);
            //TODO implement
        }).catch(function (error) {
            throw new Error(error.getMessage());
        }).then(function (config) {
            inst.scheduleConfig = config;
            resolve(true);
        });
    })
};

ScheduleParseExecutor.prototype.updateStatus = function() {

};

module.exports = {
    class: ScheduleParseExecutor
};