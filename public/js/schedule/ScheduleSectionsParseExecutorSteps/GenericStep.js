var utils = require('global').utils;
var log = require('global').log;
var ws;

GenericStep = function() {
    this.dbManager;
};

//TODO refactor promise chain
GenericStep.prototype.run = function(stepDependencies) {
    var inst = this;
    var preData;
    var dependencies;
    return new Promise(function(resolve, reject) {
        stepDependencies.get()
        .then(function(dependencies_) {
            dependencies = dependencies_;
            return inst.pre(dependencies);
        })
        .then(function(preData_) {
            preData = preData_;
            return inst.loadData(preData, dependencies);
        }, reject)
        .then(function(parsedData) {
            inst.save(parsedData, dependencies);
            return inst.post(parsedData, preData, dependencies)
        }, reject)
        .then(function(result) {
            resolve(result);
        }, reject);
    });
};

//to override
GenericStep.prototype.pre = function(dependencies) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        resolve({
            url: ''
        }, dependencies);
    })
};

//TODO
GenericStep.prototype.loadData = function(preData, dependencies) {
    var config = dependencies.config;
    var stepCode = dependencies.handler.code;
    var url = preData.url;
    var inst = this;
    return new Promise(function(resolve, reject) {
        var notifyData = inst.getNotifyData(stepCode, url);
        inst.ws().propertyChange(inst.topic.load_begin, notifyData);
        try {
            utils.loadDom(url, function (error, body) {
                if (error) {
                    log.error(error.message);
                    reject(error.message);
                }
                inst.ws().propertyChange(inst.topic.load_finish, notifyData);
                try {
                    inst.ws().propertyChange(inst.topic.parse_begin, notifyData);
                    resolve(utils.extractDataFromHtml(body, config));
                    inst.ws().propertyChange(inst.topic.parse_finish, notifyData);
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

//to override
GenericStep.prototype.post = function(parsedData, preData, dependencies) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        var result = {};
        resolve(result);
    })
};

//to override
GenericStep.prototype.save = function(data, dependencies) {
    return new Promise(function(resolve) {
        resolve(data);
    });
};

GenericStep.prototype.saveAsCollection = function(list) {

};

GenericStep.prototype.setDBManager = function(dbManager) {
    this.dbManager = dbManager;
    return this;
};

GenericStep.prototype.getNotifyData = function(stepCode, url, title) {
    return {
        step: stepCode,
        url: url,
        title: title || '...',
        tmpId: this.getIdentificator()
    }
};

GenericStep.prototype.getIdentificator = function() {
    if (!this.id) {
        this.id = utils.getRandomString();
    }
    return this.id;
};

GenericStep.prototype.ws = function() {
    if (!ws) {
        ws = require('../../common/WSServer').instance();
    }
    return ws;
};

GenericStep.prototype.topic = {
    load_begin: 'load_begin',
    load_finish: 'load_finish',
    parse_begin: 'parse_begin',
    parse_finish: 'parse_begin'
};

module.exports = {
    class: GenericStep
};