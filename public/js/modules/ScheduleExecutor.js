function ScheduleExecutor() {};

ScheduleExecutor.prototype.start = function() {
    var inst = this;
    if (!this.sched) {
        this.sched = this.every(this.schedBean.period).do(function() {
            inst.fn(inst.schedBean);
        })
    }
};

ScheduleExecutor.prototype._init = function(schedule) {
    this.schedBean = schedule;
    this.every = require('schedule').every;
    this.sched = null;
};

ScheduleExecutor.prototype.stop = function(callback) {

};

ScheduleExecutor.prototype.changePeriod = function() {

};

/**
 * need to override
 */
ScheduleExecutor.prototype.fn = function() {};

module.exports = ScheduleExecutor;