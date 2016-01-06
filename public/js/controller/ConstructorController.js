var utils = require('../utils');
var express = require('express');
var router = express.Router();
var GenericController = require('./GenericController').class;
var service = require('../service/ConstructorService').instance;
var controller;

ConstructorController = function() {};
ConstructorController.prototype = Object.create(GenericController.prototype);
ConstructorController.prototype.constructor = ConstructorController;
ConstructorController.prototype.test = function(req, res, callback) {
    var id = req.body.id;
    this.service.test(id, callback);
};
ConstructorController.prototype.testByConfig = function(req, res, callback) {
    var config = req.body;
    this.service.testByConfig(config, callback);
};

controller = new ConstructorController();
controller.setService(service);
console.log('%s: MAPPING to "ConstructorController" controller.' , Date(Date.now()));
utils.linkRequestsToModule([
    {path: '/list', method: 'list', async: true},
    {path: '/get', method: 'get', async: true},
    {path: '/save', method: 'save', async: true},
    {path: '/delete', method: 'remove', async: true},
    {path: '/test', method: 'test', async: true},
    {path: '/testByConfig', method: 'testByConfig', async: true}
], controller, router, 'post');
module.exports = {
    router: router,
    class: ConstructorController,
    instance: controller
};
