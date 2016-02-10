var log = require('global').log;
GenericQueue = function() {
    this.queue = [];
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
        log.warn("There is an error while executing sitemap task. The task will be added to the queue again. " + message);
        inst.add(task);
    }).catch(function(error) {
        log.warn("There is an error while executing sitemap task. The task will be added to the queue again. " + error.message);
        inst.add(task);
    });
};

var instance = new GenericQueue();
module.exports = {
    class: GenericQueue,
    instance: instance
};