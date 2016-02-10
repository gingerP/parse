var utils = require('global').utils;
var log = require('global').log;
var express = require('express');
var router = express.Router();
var GenericController = require('./GenericController').class;
var service = require('../service/ScheduleService').instance;
var controller;

ScheduleController = function() {};
ScheduleController.prototype = Object.create(GenericController.prototype);
ScheduleController.prototype.constructor = ScheduleController;
ScheduleController.prototype.start = function(req, res, callback) {
    var id = req.body.id;
    this.service.start(id).catch(callback).then(callback);
};
ScheduleController.prototype.stop = function(req, res, callback) {
    var id = req.body.id;
    this.service.stop(id).catch(callback).then(callback);
};
ScheduleController.prototype.restart = function(req, res, callback) {
    var id = req.body.id;
    this.service.restart(id).catch(callback).then(callback);
};
ScheduleController.prototype.startAll = function(req, res, callback) {
    var config = req.body;
    this.service.testByConfig(config).then(callback);
};
ScheduleController.prototype.validateCron = function(req, res, callback) {
    var cron = req.body.cron;
    this.service.validateCron(cron).catch(callback).then(callback);
};
ScheduleController.prototype.getScheduleTypeList = function(req, res, callback) {
    this.service.getScheduleExecutorsList().then(callback);
};

ScheduleController.prototype.test = function(req, res, callback) {
    var schedule = req.body.schedule;
    var extend = req.body.extend;
    this.service.test(schedule, extend).then(function(result) {
        callback(result);
    }, function(errorMessage) {
        callback(new Error(errorMessage));
    });
};

controller = new ScheduleController();
controller.setService(service);
log.info('MAPPING to "ScheduleController" controller.');
utils.linkRequestsToModule([
    {path: '/list', method: 'list', async: true},
    {path: '/get', method: 'get', async: true},
    {path: '/getByCriteria', method: 'getByCriteria', async: true},
    {path: '/save', method: 'save', async: true},
    {path: '/delete', method: 'remove', async: true},
    {path: '/start', method: 'start', async: true},
    {path: '/stop', method: 'stop', async: true},
    {path: '/restart', method: 'restart', async: true},
    {path: '/validateCron', method: 'validateCron', async: true},
    {path: '/getScheduleTypeList', method: 'getScheduleTypeList', async: true},
    {path: '/test', method: 'test', async: true}
], controller, router, 'post');
module.exports = {
    router: router,
    class: ScheduleController,
    instance: controller
};
