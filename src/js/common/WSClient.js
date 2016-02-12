var utils = require('global').utils;
var WebSocketClient = require('websocket').client;
var Observable = require('Observable').class;
var log = require('global').log;


WSClient = function(url) {
    this.reconnect;
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
    log.info('try to connect to "%s"', this.url);
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
        log.info('Message was send to "%s", size: %s. Data: %s',
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
            log.error('Connect Error: ' + error.toString());
            inst.retryToConnect();
        });

        this.client.on('connect', function(connection) {
            clearInterval(inst.reconnect);
            inst.reconnect = null;
            inst.connection = connection;
            log.log('WebSocket Client Connected');
            inst.connection.on('error', function(error) {
                log.error("Connection Error: " + error.toString());
                inst.retryToConnect();
            });
            inst.connection.on('close', function() {
                log.error('Connection Closed');
                inst.retryToConnect();
            });
            inst.connection.on('message', function(message) {
                var data;
                if (message.type === 'utf8') {
                    data = inst.extractMessage(message.utf8Data);
                    log.info("Received: '" + message.utf8Data + "'");
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
    if (!utils.hasContent(this.reconnect) && inst.autoReconnect && !inst.hasConnection()) {
        this.reconnect = setInterval(function() {
            if (inst.autoReconnect && !inst.hasConnection()) {
                inst.connect();
            } else {
                clearInterval(inst.reconnect);
                inst.reconnect = null;
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