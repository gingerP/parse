var GenericStep = require('./GenericStep').class;
var utils = require('../../utils');

SectionNumberStep = function() {};

SectionNumberStep.prototype = Object.create(GenericStep.prototype);
SectionNumberStep.prototype.constructor = SectionNumberStep;

SectionNumberStep.prototype.pre = function(dependencies) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        var handler = dependencies.handler.preHandler;
        var sandbox = {
            DEPS: dependencies,
            URL: null
        };
        utils.eval(handler, sandbox);
        if (!utils.hasContent(sandbox.URL)) {
            console.error('Url for sectionNumber is not defined.');
            reject('Url for sectionNumber is not defined.');
        } else {
            resolve({
                url: sandbox.URL
            }, dependencies);
        }
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