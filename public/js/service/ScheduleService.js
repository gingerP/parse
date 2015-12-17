var u = require('../utils');
var c = require('../constants');
var scheduleDBManager = require('../db/ScheduleDBManager').instance;
var GenericService = require('./GenericService').class;
var service;

ScheduleService = function() {};
ScheduleService.prototype = Object.create(GenericService.prototype);
ScheduleService.prototype.constructor = ScheduleService;
ScheduleService.prototype.start = function(id) {

};
ScheduleService.prototype.stop = function(id) {

};
ScheduleService.prototype.restart = function(id) {

};
service = new ScheduleService();
service.setManager(scheduleDBManager);

module.exports = {
    class: ScheduleService,
    instance: service
};
