'use strict';

var httpUtils = _req('src/js/utils/http-utils');
var utils = _req('src/js/utils');
var logger = _req('src/js/logger').create('GenericStep');
const EventEmitter = require('events');
var ws;

function GenericStep() {
    this.dbManager;
    this.requestHandlers = [];
    this.responseHandlers = [];
    this.emitter = new EventEmitter();
}

//TODO refactor promise chain
GenericStep.prototype.run = function (stepDependencies) {
    var inst = this;
    var preData;
    var dependencies;
    return new Promise(function (resolve, reject) {
        stepDependencies.get()
            .then(function (dependencies_) {
                dependencies = dependencies_;
                return inst.pre(dependencies);
            })
            .then(function (preData_) {
                preData = preData_;
                return inst.loadData(preData, dependencies);
            }, reject)
            .then(function (parsedData) {
                inst.save(parsedData, dependencies);
                return inst.post(parsedData, preData, dependencies)
            }, reject)
            .then(function (result) {
                resolve(result);
            }, reject);
    });
};

//to override
GenericStep.prototype.pre = function (dependencies) {
    var inst = this;
    return new Promise(function (resolve, reject) {
        resolve({
            url: ''
        }, dependencies);
    })
};

//TODO
GenericStep.prototype.loadData = function (preData, dependencies) {
    var config = dependencies.config;
    var stepCode = dependencies.handler.code;
    var url = preData.url;
    var inst = this;
    return new Promise(function (resolve, reject) {
        var params = {
            url: url,
            headers: {}
        };
        inst.emit('request', params);
        try {
            httpUtils
                .loadDom(params.url, params.headers)
                .then(
                    function (result) {
                        inst.emit('response', result.response);
                        //TODO to implement
                    },
                    function (data) {
                        //TODO to implement
                    }
                );
        } catch (error) {
            logger.error(error.message);
            reject(error.message);
        }
    });
};

//to override
GenericStep.prototype.post = function (parsedData, preData, dependencies) {
    var inst = this;
    return new Promise(function (resolve, reject) {
        var result = {};
        resolve(result);
    })
};

//to override
GenericStep.prototype.save = function (data, dependencies) {
    return new Promise(function (resolve) {
        resolve(data);
    });
};

GenericStep.prototype.saveAsCollection = function (list) {

};

GenericStep.prototype.listen = function (key, callback) {
    this.emitter.on(key, callback);
    return this;
};

GenericStep.prototype.emit = function (key, callback) {
    this.emitter.emit(key, callback);
    return this;
};

GenericStep.prototype.setDBManager = function (dbManager) {
    this.dbManager = dbManager;
    return this;
};

GenericStep.prototype.getNotifyData = function (stepCode, url, title) {
    return {
        step: stepCode,
        url: url,
        title: title || '...',
        tmpId: this.getIdentificator()
    }
};

GenericStep.prototype.getIdentificator = function () {
    if (!this.id) {
        this.id = utils.getRandomString();
    }
    return this.id;
};

GenericStep.prototype.ws = function () {
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
