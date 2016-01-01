function Observable(){
    this.listeners = {};
};

Observable.prototype.addListener = function(property, listener) {
    this.listeners[property] = this.listeners[property] || [];
    if (listener != null && ['object', 'function'].indexOf(typeof(listener)) > -1) {
        this.listeners[property].push(listener);
    }
};

Observable.prototype.propertyChange = function(property, data) {
    var methodName;
    if (this.listeners[property] && this.listeners[property].length) {
        this.listeners[property].forEach(function(listener) {
            if (typeof(listener) === 'object') {
                if (!methodName) {
                    methodName = 'on' + property.charAt(0).toUpperCase() + property.substr(1, property.length - 1) + 'Change';
                }
                if (typeof(listener[methodName]) === 'function') {
                    listener[methodName].apply(listener, data);
                }
            } else if (typeof(listener) === 'function') {
                listener.apply(null, data);
            }
        })
    }
};