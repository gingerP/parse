'use strict';

var httpUtils = _req('src/js/utils/http-utils');
var cookieUtils = _req('src/js/utils/cookies-utils');
var utils = _req('src/js/utils');
var log = _req('src/js/logger');
var logger = {
    tbc: log.create('ConstructorService')
};
var constants = require('../constants');
var configDBManager = require('../db/ParseConfigDBManager').instance;
var GenericService = require('./GenericService').class;
var service;

function ConstructorService() {
}

ConstructorService.prototype = Object.create(GenericService.prototype);
ConstructorService.prototype.constructor = ConstructorService;

ConstructorService.prototype.test = function (id, callback) {
    var inst = this;
    this.manager.get(id).then(function (config) {
        inst.testByConfig(config, callback);
    })
};
ConstructorService.prototype.testByConfig = function (config, callback) {
    var url = config.url;
    var headers = httpUtils.getDefaultHeaders();
    headers.cookie = cookieUtils.getDefaultCookies();
    logger.tbc.info('START test loading and parsing for config "%s(%s)"', config.code, config._id);
    httpUtils
        .loadDom(url, headers)
        .then(
            function (result) {
                var data;
                if (typeof(callback) == 'function') {
                    try {
                        data = utils.extractDataFromHtml(result.body, config);
                    } catch (error) {
                        logger.tbc.info('FINISH test loading and parsing for config "%s(%s)" with error: %s', config.code, config._id, error.message);
                        callback(error);
                        return;
                    }
                    logger.tbc.info('FINISH test loading and parsing for config "%s(%s)"', config.code, config._id);
                    callback(data);
                }
            },
            function (result) {
                logger.tbc.info('FINISH test loading and parsing for config "%s(%s)" with error: %s', config.code, config._id, result.error.message);
                callback(result.error);
            }
        );
};

service = new ConstructorService();
service.setManager(configDBManager);

module.exports = {
    class: ConstructorService,
    instance: service
};

