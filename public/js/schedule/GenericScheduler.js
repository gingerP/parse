var utils = require('../utils');
var CronJob = require('cron').CronJob;
var CronTime = require('cron').CronTime;
ScheduleExecutor = function() {};
ScheduleExecutor.prototype.start = function() {
    var inst = this;
    return inst.loadDependencies().then(function() {
        inst.getCronInstance().start();
        console.info('%s: Scheduler "%s" started!', Date(Date.now()), this.getName());
    });
};
ScheduleExecutor.prototype.stop = function() {
    this.getCronInstance().stop();
    console.info('%s: Scheduler "%s" stoped!', Date(Date.now()), this.getName());
    return this;
};
ScheduleExecutor.prototype.restart = function() {
    this.getCronInstance().stop();
    this.getCronInstance().start();
    console.info('%s: Scheduler "%s" restarted!', Date(Date.now()), this.getName());
    return this;
};
ScheduleExecutor.prototype.changePeriod = function(period) {
    this.stop();
    this.setPeriod(period);
    this.getCronInstance().setTime(cron.CronTime(period));
    this.start();
    return this;
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

ScheduleExecutor.prototype.loadDependencies = function() {
    return new Promise(function(resolve) {
        resolve();
    });
};

// must be override
// used for logging
ScheduleExecutor.prototype.getName = function() {
    return '';
};

module.exports = {
    class: ScheduleExecutor
};