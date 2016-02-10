var WSClient = require('../common/WSClient').class;
var stepDir = '../schedule/ScheduleSectionsParseExecutorSteps';
var LoadQueue = require('../common/GenericQueue').class;

DistributedParserClient = function(url) {
    this.url = url;
    this.queue = new LoadQueue().start();
    this.step;
    this.initListening();
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
    this.addListener('income_parse_params', function(message) {
        /*
         * data: {
         *   step: 'item',
         *   config: {...}
         *   urls: [...]
         * }
         * */
        var step;
        var data = message.data;
        if (data.step && data.urls && data.config) {
            step = inst._initStep(data.step);
            if (step) {
                data.urls.forEach(function(url) {
                    inst.addTask(data.config, url);
                });
            }
        }
    });
};

DistributedParserClient.prototype.addTask = function(config, url) {
    var inst = this;
    inst.queue.add(function() {
        return new inst.step().run(inst.getStepDependenciesCallback(config, url)).then(
            function(data) {
                inst.sendData(data, 'parsed_data', {url: url});
            }, function() {
                console.warn('Task rejected. Will be re add to queue.');
                inst.addTask(config, url);
            }
        );
    })
};

module.exports = {
    class: DistributedParserClient
};