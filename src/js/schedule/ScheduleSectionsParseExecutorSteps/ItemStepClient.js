'use strict';

var GenericStep = require('./GenericStep').class;
var logger = _req('src/js/logger').create('ItemStepClient');
var utils = _req('src/js/utils');
var httpUtils = _req('src/js/utils/http-utils');
var dbManager = require('../../db/GoodsDBManager').instance;
const EventEmitter = require('events');

function ItemStepClient() {
    this.emitter = new EventEmitter();
    this.setDBManager(dbManager);
}

ItemStepClient.prototype = Object.create(GenericStep.prototype);
ItemStepClient.prototype.constructor = ItemStepClient;

ItemStepClient.prototype.pre = function (dependencies) {
    var inst = this;
    return new Promise(function (resolve) {
        resolve({
            url: dependencies.handler.url
        }, dependencies);
    });
};

ItemStepClient.prototype.post = function (parsedData, preData, dependencies) {
    return new Promise(function (resolve) {
        resolve(parsedData);
    });
};

ItemStepClient.prototype.save = function (parsedData, dependencies) {
    return new Promise(function (resolve) {
        resolve();
    });
};

ItemStepClient.prototype.loadData = function (preData, dependencies) {
    var config = dependencies.config;
    var url = dependencies.handler.url;
    var inst = this;
    return new Promise(function (resolve, reject) {
        var params = {
            url: url,
            headers: {}
        };
        try {
            inst.emitter.emit('request', params);
            httpUtils.loadDom(params.url, params.headers).then(
                function (result) {
                    inst.emitter.emit('response', result.response);
                    try {
                        resolve(utils.extractDataFromHtml(result.body, config));
                    } catch (error) {
                        logger.error(error.message);
                        reject(error.message);
                    }
                },
                function (data) {
                    var message;
                    if (data.error) {
                        message = data.error.message;
                        logger.error(message);
                    } else {
                        message = url + ' ' + data.statusCode;
                        logger.error(message);
                    }
                    reject(message);
                }
            );
        } catch (error) {
            logger.error(error.message);
            reject(error.message);
        }
    });
};

module.exports = {
    class: ItemStepClient
};
