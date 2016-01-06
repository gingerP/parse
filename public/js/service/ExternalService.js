var utils = require('../utils');
var c = require('../constants');
var parsedDataDBManager= require('../db/ParseDataDBManager').instance;
var GenericService = require('./GenericService').class;
var service;

ExternalService = function() {};
ExternalService.prototype = Object.create(GenericService.prototype);
ExternalService.prototype.constructor = ExternalService;

ExternalService.prototype.getData = function(params, callback) {
    var inst = this;
    //TODO some validation logic
    this.rawGetData(params, callback);
};

ExternalService.prototype.rawGetData = function(params, callback) {
    parsedDataDBManager.getByCriteria({code: params.code}).then(callback);
};

ExternalService.prototype.getApiByQuery = function(params) {
    var inst = this;
    return new Promise(function(resolve, reject) {

    });
};

ExternalService.prototype.extractParams = function(queryString) {

};

service = new ExternalService();
service.setManager(parsedDataDBManager);

module.exports = {
    class: ExternalService,
    instance: service
};
