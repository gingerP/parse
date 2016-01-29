var GenericStep = require('./GenericStep').class;
var utils = require('../../utils');
const vm = require('vm');
const util = require('util');

SectionNumberStep = function() {};

SectionNumberStep.prototype = Object.create(GenericStep.prototype);
SectionNumberStep.prototype.constructor = SectionNumberStep;

SectionNumberStep.prototype.pre = function(dependencies) {
    var inst = this;
    return new Promise(function(resolve) {
        var url = utils.hasContent(dependencies.handler.url)? dependencies.handler.url: dependencies.config.url;
        resolve({
            url: url
        }, dependencies);
    });
};

SectionNumberStep.prototype.post = function(parsedData, preData, dependencies) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        var handler = dependencies.handler.postHandler;
        var sandbox = {
            PARSED: parsedData,
            RESULT: null
        };
        var context = utils.eval(handler, sandbox);
        resolve(context);
    });
};

module.exports = {
    class: SectionNumberStep
};