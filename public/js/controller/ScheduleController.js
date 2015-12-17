var utils = require('../utils');
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
    this.service.start(id).then(callback);
};
ScheduleController.prototype.stop = function(req, res, callback) {
    var id = req.body.id;
    this.service.stop(id).then(callback);
};
ScheduleController.prototype.restart = function(req, res, callback) {
    var id = req.body.id;
    this.service.restart(id).then(callback);
};
ScheduleController.prototype.startAll = function(req, res, callback) {
    var config = req.body;
    this.service.testByConfig(config).then(callback);
};

controller = new ScheduleController();
controller.setService(service);
utils.linkRequestsToModule([
    {path: '/list', method: 'list', async: true},
    {path: '/get', method: 'get', async: true},
    {path: '/save', method: 'save', async: true},
    {path: '/delete', method: 'remove', async: true},
    {path: '/start', method: 'start', async: true},
    {path: '/stop', method: 'stop', async: true},
    {path: '/restart', method: 'restart', async: true}
], controller, router, 'post');
module.exports = {
    router: router,
    class: ScheduleController,
    instance: controller
};
