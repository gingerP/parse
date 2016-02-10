var utils = require('global').utils;
var log = require('global').log;
var c = require('../constants');
var configDBManager= require('../db/ParseConfigDBManager').instance;
var GenericService = require('./GenericService').class;
var service;

ConstructorService = function() {};
ConstructorService.prototype = Object.create(GenericService.prototype);
ConstructorService.prototype.constructor = ConstructorService;
ConstructorService.prototype.test = function(id, callback) {
    var inst = this;
    this.manager.get(id).then(function(config) {
        inst.testByConfig(config, callback);
    })
};
ConstructorService.prototype.testByConfig = function(config, callback) {
    var url = config.url;
    log.info('START test loading and parsing for config "%s(%s)"', config.code, config._id);
    utils.loadDom(url, function(error, body) {
        var data;
        if (typeof(callback) == 'function') {
            if (error) {
                log.info('FINISH test loading and parsing for config "%s(%s)" with error: %s' , config.code, config._id, error.message);
                callback(error);
                return;
            }
            try {
                data = utils.extractDataFromHtml(body, config);
            } catch (error) {
                log.info('FINISH test loading and parsing for config "%s(%s)" with error: %s', config.code, config._id, error.message);
                callback(error);
                return;
            }
            log.info('FINISH test loading and parsing for config "%s(%s)"', config.code, config._id);
            callback(data);
        }
    }, 'koi8r');
};

service = new ConstructorService();
service.setManager(configDBManager);

module.exports = {
    class: ConstructorService,
    instance: service
};
