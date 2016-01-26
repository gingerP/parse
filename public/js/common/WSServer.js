var server;
var Observable = require('../common/Observable').class;
var WebSocketServer = require('websocket').server;

function WSServer(http) {
    this.http = http;
    this.connections = [];
}

WSServer.prototype = Object.create(Observable.prototype);
WSServer.prototype.constructor = WSServer;

WSServer.prototype.addListener = function(property, listener) {
    var inst = this;
    this.listeners[property] = this.listeners[property] || [];
    if (listener != null && ['object', 'function'].indexOf(typeof(listener)) > -1) {
        this.listeners[property].push(function() {

        }());
    }
};

WSServer.prototype.init = function() {
    this.ws = new WebSocketServer({
        httpServer: webServer,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false
    });
    this._initEvents();
};

WSServer.prototype._initEvents = function() {
    function originIsAllowed(origin) {
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }
    this.ws.on('request', function (request) {
        if (!originIsAllowed(request.origin)) {
            // Make sure we only accept requests from an allowed origin
            request.reject();
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            return;
        }

        var connection = request.accept('echo-protocol', request.origin);
        console.log((new Date()) + ' Connection accepted.');
        connection.on('message', function (message) {
            console.info();
            if (message.type === 'utf8') {
                console.log('Received Message: ' + message.utf8Data);
                connection.sendUTF(message.utf8Data);
            }
            else if (message.type === 'binary') {
                console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                connection.sendBytes(message.binaryData);
            }
        });
        connection.on('close', function (reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    });
};

module.exports = {
    class: WSServer,
    instance: function(http) {
        if (!server) {
            server = new WSServer(http).init();
        }
        return server;
    }
};