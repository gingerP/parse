var WSClient = require('../common/WSClint').class;
var stepDir = '../schedule/ScheduleSectionsParseExecutorSteps';
var LoadQueue = require('../common/GenericQueue').class;

DistributedParserClient = function(url) {
    this.url = url;
    this.queue = new LoadQueue().start();
    this.step;
};

DistributedParserClient.prototype = Object.create(WSClient.prototype);
DistributedParserClient.prototype.constructor = DistributedParserClient;

DistributedParserClient.prototype._initStep = function(stepName) {
    if (stepName) {
        this.stepName = stepName;
        this.step = require(stepDir + '/' + stepName).class;
    }
    return this.step;
};

DistributedParserClient.prototype.getStepDependenciesCallback = function(config, url) {
    var inst = this;
    return {
        get: function() {
            return new Promise(function(resolve) {
                resolve({
                    schedule: {},
                    config: config,
                    PREV_RESULT: null,
                    handler: {
                        url: url,
                        postHandler: "",
                        preHandler: "",
                        saveHandler: "",
                        code: inst.stepName
                    }
                });
            });
        }
    }
};

DistributedParserClient.prototype.initListening = function() {
    var inst = this;
    this.addListener('income', function(data) {
        /*
         * data: {
         *   step: 'item',
         *   config: {...}
         *   urls: [...]
         * }
         * */
        var step;
        if (data.step && data.urls && data.config) {
            step = inst._initStep(data.step);
            if (step) {
                data.urls.forEach(function(url, index) {
                    inst.queue.add(function() {
                        return new inst.step().run(inst.getStepDependenciesCallback(data.config, url)).then(function(data) {
                            inst.propertyChange('outcome', [url, data]);
                        }, function(result) {
                            //TODO
                            console.warn('Task rejected.');
                        });
                    })
                });
            }
        }
    });

    this.addListener('outcome', function(url, data) {
        inst.sendData({url: url, data: data});
    });
};


module.exports = {
    class: DistributedParserClient
};