GenericQueue = function() {
    this.queue = [];
};

GenericQueue.prototype.add = function(task) {
    this.queue.push(task);
};

GenericQueue.prototype.start = function(interval) {
    var inst = this;
    this.current = this.current || this.queue[0];
    this.interval = setInterval(function() {
        var _current = inst.current;
        var index = inst.queue.indexOf(inst.current);
        if (index > -1 && typeof(inst.queue[index + 1]) === 'function') {
            inst.current = inst.queue[index + 1];
        } else {
            inst.current = inst.queue[1];
            _current = inst.queue[0];
        }
        if (typeof(_current) === 'function') {
            inst._start(_current);
        }
    }, interval || 300);
};

GenericQueue.prototype._start = function(task) {
    var inst = this;
    task().then(function() {
        var index = inst.queue.indexOf(task);
        if (index > -1) {
            inst.queue.splice(index, 1);
        }
    });
};

var instance = new GenericQueue();
module.exports = {
    class: GenericQueue,
    instance: instance
};