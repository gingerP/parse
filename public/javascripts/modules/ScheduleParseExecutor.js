var Parent = require('./ScheduleExecutor');
var ParseConfigDBM = require('../db/ParseConfigDBManager');
var ParseDataDBM = require('../db/ParseDataDBManager');
var u = require('../utils');

function ScheduleParseExecutor() {};

ScheduleParseExecutor.prototype = Object.create(Parent.prototype);
ScheduleParseExecutor.prototype.constructor = ScheduleParseExecutor;

ScheduleParseExecutor.prototype.init = function(schedule, callback) {
    var inst = this;
    this._init(schedule);
    this.configDBM = new ParseConfigDBM();
    this.dataDBM = new ParseDataDBM();
    this.configDBM.getEntity({code: schedule.configCode}, function(data) {
        inst.config = data;
        if (typeof(callback) == 'function') {
            callback(data);
        }
    });
    return this;
};

ScheduleParseExecutor.prototype.fn = function(bean) {
    var inst = this;
    var url = inst.config.url;
    console.log('ScheduleParseExecutor iteration start "' + inst.schedBean.configCode + '"');
    u.loadDom(url, function(body) {
        var data = u.extractDataFromHtml(body, inst.config);
        var entity = {
            code: inst.schedBean.configCode,
            data: data
        };
        inst.dataDBM.update(entity);
    }, 'koi8r');
};

module.exports = ScheduleParseExecutor;