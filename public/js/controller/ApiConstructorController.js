var utils = require('global').utils;
var log = require('global').log;
var express = require('express');
var router = express.Router();
var GenericController = require('./GenericController').class;
var service = require('../service/ApiConstructorService').instance;
var controller;

ApiConstructorController = function() {};
ApiConstructorController.prototype = Object.create(GenericController.prototype);
ApiConstructorController.prototype.constructor = ApiConstructorController;
ApiConstructorController.prototype.test = function(req, res, callback) {
    var params = {};
    this.service.test(params, callback);
};

controller = new ApiConstructorController();
controller.setService(service);
log.info('MAPPING to "ApiConstructorController" controller.');
utils.linkRequestsToModule([
    {path: '/list', method: 'list', async: true},
    {path: '/get', method: 'get', async: true},
    {path: '/save', method: 'save', async: true},
    {path: '/delete', method: 'remove', async: true},
    {path: '/test', method: 'test', async: true}
], controller, router, 'post');
module.exports = {
    router: router,
    class: ApiConstructorController,
    instance: controller
};
