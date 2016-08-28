(function() {
    'use strict';

    var GenericStep = require('./GenericStep').class;
    var logger = _req('src/js/logger').create('WebServer');
    var utils = _req('src/js/utils');
    var dbManager = require('../../db/GoodsDBManager').instance;

    function ItemStepSM() {
        this.setDBManager(dbManager);
    }

    ItemStepSM.prototype = Object.create(GenericStep.prototype);
    ItemStepSM.prototype.constructor = ItemStepSM;

    ItemStepSM.prototype.pre = function(dependencies) {
        var inst = this;
        return new Promise(function(resolve) {
            resolve({
                url: dependencies.handler.url
            }, dependencies);
        });
    };

    ItemStepSM.prototype.post = function(parsedData, preData, dependencies) {
        return new Promise(function(resolve) {
            resolve(parsedData);
        });
    };

    ItemStepSM.prototype.save = function(parsedData, dependencies) {
        var inst = this;
        return new Promise(function(resolve) {
            var toSave = parsedData.length && parsedData[0][0]? parsedData[0][0]: null;
            if (!toSave) {
                resolve();
            } else {
                toSave.url = dependencies.handler.url;
            }
            inst.dbManager.save(toSave).then(resolve);
        });
    };

    ItemStepSM.prototype.loadData = function(preData, dependencies) {
        var config = dependencies.config;
        var url = dependencies.handler.url;
        var inst = this;
        return new Promise(function(resolve, reject) {
            try {
                utils.loadDom(url, function (error, body) {
                    if (error) {
                        logger.error(error.message);
                        reject(error.message);
                    }
                    try {
                        resolve(utils.extractDataFromHtml(body, config));
                    } catch (error) {
                        logger.error(error.message);
                        reject(error.message);
                    }
                }, 'koi8r');
            } catch (error) {
                logger.error(error.message);
                reject(error.message);
            }
        });
    };

    module.exports = {
        class: ItemStepSM
    };
})();