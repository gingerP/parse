var server;
var Observable = require('../common/Observable').class;
var WebSocketServer = require('websocket').server;
var utils = require('../utils');

function WSServer(http) {
    this.http = http;
    this.connections = {};
    this.listeners = {};
}

WSServer.prototype = Object.create(Observable.prototype);
WSServer.prototype.constructor = WSServer;

WSServer.prototype.init = function() {
    this.ws = new WebSocketServer({
        httpServer: this.http,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false
    });
    this._initEvents();
    return this;
};

WSServer.prototype._initEvents = function() {
    var inst = this;
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
        inst.addConnection(inst.evaluateTopic(request.resource), connection);
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
            inst.removeConnection(this);
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    });
};

WSServer.prototype.evaluateTopic = function(original) {
    var result;
    var keys;
    var resultKeys = [];
    var index = 0;
    var key;
    if (original) {
        keys = original.split('/');
        while(index < keys.length) {
            key = keys[index].trim();
            if (key.length) {
                resultKeys.push(key);
            }
            index++;
        }
    }
    if (resultKeys.length) {
        result = resultKeys.join('|');
    }
    return result;
};

WSServer.prototype.addConnection = function(topic, connection) {
    if (!topic) {
        console.warn('Invalid topic for websocket connection: "&s"', topic);
        return;
    }
    this.connections[topic] = this.connections[topic] || [];
    if (this.connections[topic].indexOf(connection) < 0) {
        this.connections[topic].push(connection);
        this.addListener(topic, function(data) {
            connection.sendUTF(data);
        })
    }
    return this;
};

WSServer.prototype.removeConnection = function(connection) {
    var index;
    for(var topic in this.connections) {
        index = this.connections[topic].indexOf(connection);
        if (index > -1) {
            this.connections[topic].splice(index, 1);
        }
    }
    return this;
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