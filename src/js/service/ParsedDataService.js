var parsedDataDBManager= require('../db/ParseDataDBManager').instance;
var GenericService = require('./GenericService').class;
var service;

ParsedDataService = function() {};
ParsedDataService.prototype = Object.create(GenericService.prototype);
ParsedDataService.prototype.constructor = ParsedDataService;

service = new ParsedDataService();
service.setManager(parsedDataDBManager);

module.exports = {
    class: ParsedDataService,
    instance: service
};
