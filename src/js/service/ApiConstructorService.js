var configDBManager= require('../db/ApiConstructorDBManager').instance;
var GenericService = require('./GenericService').class;
var externalService = require('./ExternalService').instance;
var service;

ApiConstructorService = function() {};
ApiConstructorService.prototype = Object.create(GenericService.prototype);
ApiConstructorService.prototype.constructor = ApiConstructorService;

ApiConstructorService.prototype.test = function(queryString, callback) {
    var inst = this;
    externalService.rawGetData(params, function(data) {
        if (typeof(callback) === 'function') {
            callback(data);
        }
    });
};

service = new ApiConstructorService();
service.setManager(configDBManager);

module.exports = {
    class: ApiConstructorService,
    instance: service
};
