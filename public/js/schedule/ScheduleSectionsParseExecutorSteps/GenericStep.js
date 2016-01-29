var utils = require('../../utils');
GenericStep = function() {
    this.dbManager;
};

//TODO refactor promise chain
GenericStep.prototype.run = function(stepDependencies) {
    var inst = this;
    var preData;
    var dependencies;
    return new Promise(function(resolve) {
        stepDependencies.get().then(function(dependencies_) {
            dependencies = dependencies_;
            return inst.pre(dependencies);
        }).then(function(preData_) {
            preData = preData_;
            return inst.loadData(preData, dependencies);
        }).then(function(parsedData) {
            inst.save(parsedData, dependencies);
            return inst.post(parsedData, preData, dependencies)
        }).then(function(result) {
            resolve(result);
        });
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

GenericStep.prototype.loadData = function(preData, dependencies) {
    var config = dependencies.config;
    var url = preData.url;
    return new Promise(function(resolve) {
        utils.loadDom(url, function(error, body) {
            try {
                resolve(utils.extractDataFromHtml(body, config));
            } catch(error) {
                console.error();
                reject(null);
            }
        }, 'koi8r');
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
        resolve();
    });
};

GenericStep.prototype.saveAsCollection = function(list) {

};

GenericStep.prototype.setDBManager = function(dbManager) {
    this.dbManager = dbManager;
    return this;
};

module.exports = {
    class: GenericStep
};