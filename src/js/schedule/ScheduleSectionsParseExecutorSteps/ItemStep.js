var GenericStep = require('./GenericStep').class;
var utils = require('../../utils');
var dbManager = require('../../db/ItemDBManager').instance;
const vm = require('vm');
const util = require('util');

ItemStep = function() {
    this.setDBManager(dbManager);
};

ItemStep.prototype = Object.create(GenericStep.prototype);
ItemStep.prototype.constructor = ItemStep;

ItemStep.prototype.pre = function(dependencies) {
    var inst = this;
    return new Promise(function(resolve) {
        var handler = dependencies.handler.preHandler;
        var sandbox = {
            DEPS: dependencies,
            URL: null
        };
        utils.eval(handler, sandbox);
        resolve({
            url: sandbox.URL
        }, dependencies);
    });
};

ItemStep.prototype.post = function(parsedData, preData, dependencies) {
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

ItemStep.prototype.save = function(parsedData, dependencies) {
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
    class: ItemStep
};