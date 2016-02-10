var Observable = require('../common/Observable').class;
var utils = require('global').utils;
var log = require('global').log;
var CronJob = require('cron').CronJob;
var CronTime = require('cron').CronTime;
ScheduleExecutor = function() {};
ScheduleExecutor.prototype = Object.create(Observable.prototype);
ScheduleExecutor.prototype.constructor = ScheduleExecutor;

ScheduleExecutor.prototype.start = function() {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst.getCronInstance().start();
        log.info('Scheduler "%s" started!', inst.getName());
        resolve(true);
    });
};
ScheduleExecutor.prototype.stop = function() {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst.getCronInstance().stop();
        log.info('Scheduler "%s" stoped!', inst.getName());
        resolve(true);
    });
};
ScheduleExecutor.prototype.restart = function() {
    var inst = this;
    return this.stop().then(function() {
        return inst.start();
    });
};
ScheduleExecutor.prototype.changePeriod = function(period) {
    var inst = this;
    this.stop().then(function() {
        inst.setPeriod(period);
        inst.getCronInstance().setTime(cron.CronTime(period));
        return inst.start();
    });
};
ScheduleExecutor.prototype.getExecutor = function() {
    return function() {};
};
ScheduleExecutor.prototype.getPeriod = function() {
    return this.period || '';
};
ScheduleExecutor.prototype.setPeriod = function(period) {
    this.period = period;
    return this;
};
ScheduleExecutor.prototype.getCronInstance = function() {
    if (!this.cron) {
        try {
            this.cron = new CronJob({
                cronTime: this.getPeriod(),
                onTick: this.getExecutor(),
                start: false,
                timeZone: 'America/Los_Angeles'
            });
        } catch(e) {
            throw new Error(e.message);
        }
    }
    return this.cron;
};

// must be override
// used for logging
ScheduleExecutor.prototype.getName = function() {
    return '';
};

module.exports = {
    class: ScheduleExecutor
};