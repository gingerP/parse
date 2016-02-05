var GenericStep = require('./GenericStep').class;
var utils = require('../../utils');
var dbManager = require('../../db/GoodsDBManager').instance;

ItemStep = function() {
    this.setDBManager(dbManager);
};

ItemStep.prototype = Object.create(GenericStep.prototype);
ItemStep.prototype.constructor = ItemStep;

ItemStep.prototype.pre = function(dependencies) {
    var inst = this;
    return new Promise(function(resolve) {
        resolve({
            url: dependencies.loc
        }, dependencies);
    });
};

ItemStep.prototype.post = function(parsedData, preData, dependencies) {
    return new Promise(function(resolve) {
        resolve(parsedData);
    });
};

ItemStep.prototype.save = function(parsedData, dependencies) {
    var inst = this;
    return new Promise(function(resolve) {
        var toSave = parsedData.length && parsedData[0][0]? parsedData[0][0]: null;
        if (!toSave) {
            resolve();
        } else {
            toSave.url = dependencies.loc;
        }
        inst.dbManager.save(toSave).then(resolve);
    });
};

GenericStep.prototype.loadData = function(preData, dependencies) {
    var config = dependencies.config;
    var url = preData.url;
    var inst = this;
    return new Promise(function(resolve, reject) {
        try {
            utils.loadDom(url, function (error, body) {
                if (error) {
                    console.error(error.message);
                    reject(error.message);
                }
                try {
                    resolve(utils.extractDataFromHtml(body, config));
                } catch (error) {
                    console.error(error.message);
                    reject(error.message);
                }
            }, 'koi8r');
        } catch (error) {
            console.error(error.message);
            reject(error.message);
        }
    });
};

module.exports = {
    class: ItemStep
};