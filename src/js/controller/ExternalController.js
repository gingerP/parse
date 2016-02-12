var utils = _req('src/js/utils');
var logger = _req('src/js/logger').create('ExternalController');
var express = require('express');
var router = express.Router();
var GenericController = require('./GenericController').class;
var service = require('../service/ExternalService').instance;
var controller;

ExternalController = function() {};
ExternalController.prototype = Object.create(GenericController.prototype);
ExternalController.prototype.constructor = ExternalController;
ExternalController.prototype.getData = function(req, res, callback) {
    var params = {};
    this.service.getData(params).then(callback);
};

controller = new ExternalController();
controller.setService(service);
logger.info('MAPPING to "ApiConstructorController" controller.');
utils.linkRequestsToModule([
    {path: '/get', method: 'getData', async: true}
], controller, router, 'post');
module.exports = {
    router: router,
    class: ExternalController,
    instance: controller
};
