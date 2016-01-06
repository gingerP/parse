var utils = require('../utils');

function Observable(){};

Observable.prototype.addListener = function(property, listener, isAsync) {
    isAsync = utils.hasContent(isAsync)? !!isAsync: false;
    this.listeners = this.listeners || {};
    this.listeners[property] = this.listeners[property] || [];
    if (listener != null && ['object', 'function'].indexOf(typeof(listener)) > -1) {
        this.listeners[property].push({
            async: isAsync,
            listener: listener
        });
    }
};

Observable.prototype.propertyChange = function(property, data) {
    var methodName;
    if (this.listeners && this.listeners[property] && this.listeners[property].length) {
        this.listeners[property].forEach(function(listener) {
            var func;
            var context;
            if (typeof(listener.listener) === 'object') {
                if (!methodName) {
                    methodName = 'on' + property.charAt(0).toUpperCase() + property.substr(1, property.length - 1) + 'Change';
                }
                if (typeof(listener.listener[methodName]) === 'function') {
                    func = listener.listener[methodName];
                    context = listener.listener;
                }
            } else if (typeof(listener.listener) === 'function') {
                func = listener.listener;
                context = null;
            }
            if (listener.async) {
                setTimeout(function() {
                    func.apply(context, data);
                }, 0);
            } else {
                func.apply(context, data);
            }
        })
    }
};

module.exports = {
    class: Observable
};