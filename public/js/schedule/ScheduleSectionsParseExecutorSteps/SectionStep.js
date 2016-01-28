var GenericStep = require('./GenericStep').class;
var utils = require('../../utils');
const vm = require('vm');
const util = require('util');

SectionStep = function() {};

SectionStep.prototype = Object.create(GenericStep.prototype);
SectionStep.prototype.constructor = SectionStep;

SectionStep.prototype.pre = function(dependencies) {
    var inst = this;
    return new Promise(function(resolve) {
        var url = utils.hasContent(dependencies.handler.url)? dependencies.handler.url: dependencies.config.url;
        resolve({
            url: url
        }, dependencies);
    });
};

SectionStep.prototype.post = function(parsedData, preData, dependencies) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        var post = dependencies.handler.post;
        var sandbox = {
            PARSED: parsedData,
            RESULT: null
        };
        var context = new vm.createContext(sandbox);
        var compiledHandler = new vm.Script(post);
        try {
            compiledHandler.runInContext(context);
            resolve(util.inspect(context));
        } catch(e) {
            reject(sandbox);
        }
    });
};

module.exports = {
    class: SectionStep
};