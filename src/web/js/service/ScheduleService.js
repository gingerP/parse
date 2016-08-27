define([
    'service/GenericService'
], function(GenericService) {
    'use strict';

    var api;

    function ScheduleService() {}

    ScheduleService.prototype = Object.create(GenericService.class.prototype);
    ScheduleService.prototype.constructor = ScheduleService;
    ScheduleService.prototype.start = function(id, callback) {
        this._load(this.getUrl('start'), callback, {id: id});
    };
    ScheduleService.prototype.stop = function(id, callback) {
        this._load(this.getUrl('stop'), callback, {id: id});
    };
    ScheduleService.prototype.restart = function(id, callback) {
        this._load(this.getUrl('restart'), callback, {id: id});
    };
    ScheduleService.prototype.validateCron = function(cron, callback) {
        this._load(this.getUrl('validateCron'), callback, {cron: cron});
    };
    ScheduleService.prototype.test = function(schedule, extend, callback) {
        this._load(this.getUrl('test'), callback, {schedule: schedule, extend: extend});
    };
    ScheduleService.prototype.getNew = function() {
        var id = U.getRandomString();
        return {_isNew: true, _id: id, code: null, config: '', cron: null, status: null, progress: null, extend: null};
    };
    ScheduleService.prototype.getUrlPrefix = function() {
        return 'schedule';
    };
    ScheduleService.prototype.getScheduleTypeList = function(callback) {
        this._load(this.getUrl('getScheduleTypeList'), callback);
    };
    api = {
        class: ScheduleService,
        instance: new ScheduleService()
    };
    return api;
});