var server;
var Observable = require('../common/Observable').class;

function WSServer() {}

WSServer.prototype = Object.create(Observable.prototype);
WSServer.prototype.constructor = WSServer;

WSServer.prototype.addListener = function(property, listener) {
    var inst = this;
    this.listeners[property] = this.listeners[property] || [];
    if (listener != null && ['object', 'function'].indexOf(typeof(listener)) > -1) {
        this.listeners[property].push(function() {
            //listener
        });
    }
};




server = new WSServer();
module.exports = {
    class: WSServer,
    instance: server
};