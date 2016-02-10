var GenericStep = require('./GenericStep').class;
var utils = require('global').utils;
var log = require('global').log;
var dbManager = require('../../db/GoodsDBManager').instance;

ItemStepClient = function() {
    this.setDBManager(dbManager);
};

ItemStepClient.prototype = Object.create(GenericStep.prototype);
ItemStepClient.prototype.constructor = ItemStepClient;

ItemStepClient.prototype.pre = function(dependencies) {
    var inst = this;
    return new Promise(function(resolve) {
        resolve({
            url: dependencies.handler.url
        }, dependencies);
    });
};

ItemStepClient.prototype.post = function(parsedData, preData, dependencies) {
    return new Promise(function(resolve) {
        resolve(parsedData);
    });
};

ItemStepClient.prototype.save = function(parsedData, dependencies) {
    return new Promise(function(resolve) {
        resolve();
    });
};

ItemStepClient.prototype.loadData = function(preData, dependencies) {
    var config = dependencies.config;
    var url = dependencies.handler.url;
    var inst = this;
    return new Promise(function(resolve, reject) {
        try {
            utils.loadDom(url, function (error, body) {
                if (error) {
                    log.error(error.message);
                    reject(error.message);
                }
                try {
                    resolve(utils.extractDataFromHtml(body, config));
                } catch (error) {
                    log.error(error.message);
                    reject(error.message);
                }
            }, 'koi8r');
        } catch (error) {
            log.error(error.message);
            reject(error.message);
        }
    });
};

module.exports = {
    class: ItemStepClient
};