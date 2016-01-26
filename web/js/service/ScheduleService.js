define([
    './GenericService.js'
], function(GenericService) {
    var api;
    ScheduleService = function() {};
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
    ScheduleService.prototype.getNew = function() {
        var id = U.getRandomString();
        return {_isNew: true, _id: id, code: null, config: '', cron: null, status: null, progress: null, type: {code: "ScheduleParseExecutor", extendConfig: false}};
    };
    ScheduleService.prototype.getNewAsync = function(callback) {
        this._load(this.getUrl('new'), callback);
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