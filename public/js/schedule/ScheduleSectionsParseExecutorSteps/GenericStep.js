var utils = require('../../utils');
GenericStep = function() {};

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
            return inst.post(parsedData, preData, dependencies)
        }).then(resolve);
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

module.exports = {
    class: GenericStep
};