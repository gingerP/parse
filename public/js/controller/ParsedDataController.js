var utils = require('global').utils;
var log = require('global').log;
var express = require('express');
var router = express.Router();
var GenericController = require('./GenericController').class;
var service = require('../service/ParsedDataService').instance;
var controller;

ParsedDataController = function() {};
ParsedDataController.prototype = Object.create(GenericController.prototype);
ParsedDataController.prototype.constructor = ParsedDataController;
ParsedDataController.prototype.test = function(req, res, callback) {
};

controller = new ParsedDataController();
controller.setService(service);
log.info('MAPPING to "ParsedDataController" controller.');
utils.linkRequestsToModule([
    {path: '/list', method: 'list', async: true},
    {path: '/get', method: 'get', async: true},
    {path: '/getByCriteria', method: 'getByCriteria', async: true}/*,
    {path: '/save', method: 'save', async: true},
    {path: '/delete', method: 'remove', async: true}*/
], controller, router, 'post');
module.exports = {
    router: router,
    class: ParsedDataController,
    instance: controller
};
