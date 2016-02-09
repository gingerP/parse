var utils = require('../utils');
var WebSocketClient = require('websocket').client;
var Observable = require('../common/Observable').class;


WSClient = function(url) {
    this.url = url || this.url;
    this.autoReconnect = false;
    this.reconnectInterval = 5000;
};

WSClient.prototype = Object.create(Observable.prototype);
WSClient.prototype.constructor = WSClient;

WSClient.prototype.initClient = function() {
    this.client = new WebSocketClient({tlsOptions: {rejectUnauthorized: false}});
    this._initEvents();
    return this;
};

WSClient.prototype.connect = function(url) {
    this.url = url || this.url;
    this.client.connect(this.url, 'echo-protocol');
    return this;
};

WSClient.prototype.makeAutoReconnect = function(state, interval) {
    this.reconnectInterval = interval || 5000;
    this.autoReconnect = !utils.hasContent(state)? true: !!state;
    return this;
};

WSClient.prototype.disconnect = function() {
    if (this.connection) {
        this.connection.abort();
    }
    return this;
};

WSClient.prototype.sendData = function(data, type, extend) {
    var humanSize;
    var message;
    var inst = this;
    if (this.connection) {
        message = inst.prepareMessage(data, type, extend);
        this.connection.sendUTF(message);
        humanSize = utils.getStringByteSize(message);
        console.log('%s: Message was send to "%s", size: %s. Data: %s',
            Date(Date.now()),
            this.url,
            humanSize,
            message.length > 200? message.slice(0, 200) + "...": message
        );
    }
};

WSClient.prototype._initEvents = function() {
    var inst = this;
    if (this.client) {
        this.client.on('connectFailed', function(error) {
            console.error('Connect Error: ' + error.toString());
            inst.retryToConnect();
        });

        this.client.on('connect', function(connection) {
            inst.connection = connection;
            console.log('WebSocket Client Connected');
            inst.connection.on('error', function(error) {
                console.error("Connection Error: " + error.toString());
                inst.retryToConnect();
            });
            inst.connection.on('close', function() {
                console.error('Connection Closed');
                inst.retryToConnect();
            });
            inst.connection.on('message', function(message) {
                var data;
                if (message.type === 'utf8') {
                    data = inst.extractMessage(message.utf8Data);
                    console.log("Received: '" + message.utf8Data + "'");
                    inst.propertyChange('income_' + data.type, data);
                }
            });
        });
    }
    return this;
};

WSClient.prototype.hasConnection = function() {
    return this.connection && this.connection.connected;
};

WSClient.prototype.retryToConnect = function() {
    var inst = this;
    var reconnect;
    if (inst.autoReconnect && !inst.hasConnection()) {
        reconnect = setInterval(function() {
            if (inst.autoReconnect && !inst.hasConnection()) {
                inst.connect();
            } else {
                clearInterval(reconnect);
            }
        }, inst.reconnectInterval);
    }
};

WSClient.prototype.prepareMessage = function(data, type, extend) {
    return JSON.stringify({
        type: type,
        data: data,
        extend: extend || {}
    });
};

WSClient.prototype.extractMessage = function(data) {
    return JSON.parse(data);
};

module.exports = {
    class: WSClient
};