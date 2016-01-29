var GenericStep = require('./GenericStep').class;
var utils = require('../../utils');
var dbManager = require('../../db/NavigationTreeDBManager').instance;
const vm = require('vm');
const util = require('util');

SectionStep = function() {
    this.setDBManager(dbManager);
};

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
        var handler = dependencies.handler.postHandler;
        var sandbox = {
            PARSED: parsedData,
            RESULT: null
        };
        var context = utils.eval(handler, sandbox);
        resolve(context);
    });
};

SectionStep.prototype.save = function(parsedData, dependencies) {
    var inst = this;
    return new Promise(function(resolve) {
        var handler = dependencies.handler.saveHandler;
        var sandbox = {
            PARSED: parsedData,
            RESULT: null,
            TEST: true
        };
        var context = utils.eval(handler, sandbox);
        if (context.TEST === true) {
            resolve(context);
        } else {
            inst.dbManager.save(context.RESULT).then(resolve);
        }
    });
};

module.exports = {
    class: SectionStep
};