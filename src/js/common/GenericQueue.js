(function() {
    'use strict';

    var logger = _req('src/js/logger').create('GenericQueue');

    var DEFAULT_INTERVAL = 300;
    var interval = 300;
    var intervalGrowStep = 50;
    var sleepTimeout = 5000;

    function GenericQueue() {
        this.queue = [];
    }

    GenericQueue.prototype.growUpTimeout = function() {

    };

    GenericQueue.prototype.sleep = function() {

    };

    GenericQueue.prototype.add = function(task) {
        this.queue.push(task);
    };

    GenericQueue.prototype.start = function(interval) {
        var inst = this;
        this.interval = setInterval(function() {
            var task;
            if (inst.queue.length) {
                task = inst.queue.splice(0, 1);
                if (typeof(task[0]) === 'function') {
                    inst._start(task[0]);
                }
            }
        }, interval || 300);
        return this;
    };

    GenericQueue.prototype._start = function(task) {
        var inst = this;
        task().then(function() {
                //TODO
            },
            function(message) {
                logger.warn("There is an error while executing sitemap task. The task will be added to the queue again. " + message);
                inst.add(task);
            }).catch(function(error) {
            logger.warn("There is an error while executing sitemap task. The task will be added to the queue again. " + error.message);
            inst.add(task);
        });
    };

    var instance = new GenericQueue();
    module.exports = {
        class: GenericQueue,
        instance: instance
    };
})();