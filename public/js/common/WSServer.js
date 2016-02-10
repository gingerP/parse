var server;
var Observable = require('../common/Observable').class;
var WebSocketServer = require('websocket').server;
var log = require('global').log;
var listenerToOut = '__toOut';
var listenerToIn = '__toIn';

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
        autoAcceptConnections: false,
        rejectUnauthorized: false
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
            log.warn('Connection from origin ' + request.origin + ' rejected.');
            return;
        }
        var connection = request.accept('echo-protocol', request.origin);
        var topic = inst.evaluateTopic(request.resource);
        log.info('Peer "%s" connected.', connection.remoteAddress);
        inst.addConnection(topic, connection, request.key);
        connection.on('message', function (message) {
            var data;
            if (message.type == 'utf8') {
                data = inst.extractMessage(message.utf8Data);
                inst.propertyChange('income_' + data.type, [
                    data,
                    connection
                ]);
            }
        });
        connection.on('close', function (reasonCode, description) {
            inst.removeConnection(this, {code: reasonCode, description: description});
            log.info('Peer "%s" disconnected.', connection.remoteAddress);
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

WSServer.prototype.addConnection = function(topic, connection, id) {
    var connectionWraper;
    if (!topic) {
        log.warn('Invalid topic for websocket connection: "&s"', topic);
        return;
    }
    this.connections[topic] = this.connections[topic] || [];
    if (this.connections[topic].indexOf(connection) < 0) {
        this.connections[topic].push(connection);
        connectionWraper = this.createConnectionWrapper(connection, topic, id);
        this.addListener(topic + listenerToOut, connectionWraper);
        this.propertyChange('new_connection', connectionWraper);
    }
    return this;
};

WSServer.prototype.getListeners = function(topic) {
    return this.listeners[topic];
};

WSServer.prototype.removeConnection = function(connection, reason) {
    var index;
    for(var topic in this.connections) {
        index = this.connections[topic].indexOf(connection);
        if (index > -1) {
            this.connections[topic].splice(index, 1);
            this.propertyChange('remove_connection', [connection, reason]);
        }
    }
    return this;
};

WSServer.prototype.createConnectionWrapper = function(connection, topic, id) {
    var inst = this;
    var api;
    var topicEvent = 'on' + topic.slice(0, 1).toUpperCase() + topic.slice(1, topic.length - 1) + 'Change';
    api = {
        getTopic: function() {
            return topic;
        },
        getId: function() {
            return id;
        },
        sendData: function(data, type) {
            connection.sendUTF(inst.prepareMessage(data, type));
            return api;
        },
        equalConnection: function(con) {
            return connection == con;
        }
    };
    api[topicEvent] = function(data) {
        connection.sendUTF(inst.prepareMessage(data, 'global_' + topic));
    };
    return api;
};

WSServer.prototype.prepareMessage = function(data, type, extend) {
    return JSON.stringify({
        type: type,
        data: data,
        extend: extend || {}
    });
};

WSServer.prototype.extractMessage = function(data) {
    return JSON.parse(data);
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