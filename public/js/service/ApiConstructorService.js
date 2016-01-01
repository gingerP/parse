var u = require('../utils');
var c = require('../constants');
var configDBManager= require('../db/ApiConstructorDBManager').instance;
var GenericService = require('./GenericService').class;
var service;

ApiConstructorService = function() {};
ApiConstructorService.prototype = Object.create(GenericService.prototype);
ApiConstructorService.prototype.constructor = ApiConstructorService;
ApiConstructorService.prototype.get = function(code, callback) {
};

service = new ApiConstructorService();
service.setManager(configDBManager);
service.setManager(configDBManager);

module.exports = {
    class: ApiConstructorService,
    instance: service
};
