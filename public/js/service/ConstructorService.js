var u = require('../utils');
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
    console.log('START test loading and parsing for config "' + config.code + '(' + config._id + ')"');
    u.loadDom(url, function(error, body) {
        var data;
        if (typeof(callback) == 'function') {
            if (error) {
                console.log('FINISH test loading and parsing for config "' + config.code + '(' + config._id + ')" with error ' + error.message);
                callback(error);
                return;
            }
            try {
                data = u.extractDataFromHtml(body, config);
            } catch (error) {
                console.log('FINISH test loading and parsing for config "' + config.code + '(' + config._id + ')" with error ' + error.message);
                callback(error);
                return;
            }
            console.log('FINISH test loading and parsing for config "' + config.code + '(' + config._id + ')"');
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
