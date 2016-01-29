var GenericStep = require('./GenericStep').class;
var utils = require('../../utils');
const vm = require('vm');
const util = require('util');

SectionPageItemStep = function() {};

SectionPageItemStep.prototype = Object.create(GenericStep.prototype);
SectionPageItemStep.prototype.constructor = SectionPageItemStep;

SectionPageItemStep.prototype.pre = function(dependencies) {
    var inst = this;
    return new Promise(function(resolve) {
        var url = utils.hasContent(dependencies.handler.url)? dependencies.handler.url: dependencies.config.url;
        resolve({
            url: url
        }, dependencies);
    });
};

SectionPageItemStep.prototype.post = function(parsedData, preData, dependencies) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        var post = dependencies.handler.post;
        var sandbox = {
            PARSED: parsedData,
            RESULT: null
        };
        var context = utils.eval(post, sandbox);
        resolve(context);
    });
};

module.exports = {
    class: SectionPageItemStep
};