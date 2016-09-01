(function () {
    'use strict';

    var WSClient = require('../common/WSClient').class;
    var stepDir = '../schedule/ScheduleSectionsParseExecutorSteps';
    var LoadQueue = require('../common/GenericQueue').class;
    var logger = _req('src/js/logger').create('DistributedParserClient');
    var utils = _req('src/js/utils');
    var _ = require('lodash');
    var REQUEST_COUNT_FOR_RESTART = 500;
    var ERROR_COUNT_FOR_RESTART = 20;

    function DistributedParserClient(url) {
        this.url = url;
        this.queue = new LoadQueue().start();
        this.step;
        this.requestsCount = 0;
        this.errorCount = 0;
        this.initListening();
        this.tricks = [];
    }

    DistributedParserClient.prototype = Object.create(WSClient.prototype);
    DistributedParserClient.prototype.constructor = DistributedParserClient;

    DistributedParserClient.prototype._initStep = function (stepName) {
        if (stepName) {
            this.stepName = stepName;
            this.step = require(stepDir + '/' + stepName).class;
        }
        return this.step;
    };

    DistributedParserClient.prototype.getStepDependenciesCallback = function (config, url) {
        var inst = this;
        return {
            get: function () {
                return new Promise(function (resolve) {
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

    DistributedParserClient.prototype.initListening = function () {
        var inst = this;
        this.addListener('income_parse_params', function (message) {
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
                    data.urls.forEach(function (url) {
                        inst.addTask(data.config, url, inst.cookieTrick);
                    });
                }
            }
        });
    };

    DistributedParserClient.prototype.manageTaskResult = function (url, data) {
        this.sendData(data, 'parsed_data', {url: url});
    };

    DistributedParserClient.prototype.manageTaskError = function (url, data) {
        logger.warn('Task rejected. Will be re add to queue.');
        this.errorCount++;
        this.addTask(data.config, url);

    };

    DistributedParserClient.prototype.addTask = function (config, url) {
        var inst = this;
        inst.queue.add(function () {
            if (inst.requestsCount > REQUEST_COUNT_FOR_RESTART || inst.errorCount > ERROR_COUNT_FOR_RESTART) {
                utils.requestParentForRestart();
            }
            inst.requestsCount++;
            return new inst.step()
                .listen('request', inst.runRequestTricks.bind(inst))
                .listen('response', inst.runResponseTricks.bind(inst))
                .run(inst.getStepDependenciesCallback(config, url))
                .then(inst.manageTaskResult.bind(inst, url))
                .catch(inst.manageTaskError.bind(inst, url));
        });

    };

    DistributedParserClient.prototype.addTrick = function(trick) {
        if (trick) {
            this.tricks.push(trick);
        }
        return this;
    };

    DistributedParserClient.prototype.runRequestTricks = function(requestData) {
        _.forEach(this.tricks, function(trick) {
            trick.handleRequest(requestData);
        });
        return this;
    };

    DistributedParserClient.prototype.runResponseTricks = function(response) {
        _.forEach(this.tricks, function(trick) {
            trick.handleResponse(response);
        });
        return this;
    };

    module.exports = {
        class: DistributedParserClient
    };
})();