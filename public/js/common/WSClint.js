var utils = require('../utils');
var WebSocketClient = require('websocket').client;
var Observable = require('../common/Observable').class;


WSClient = function(url) {
};

WSClient.prototype = Object.create(Observable.prototype);
WSClient.prototype.constructor = WSClient;

WSClient.prototype.initClient = function() {
    this.client = new WebSocketClient({tlsOptions: {rejectUnauthorized: false}});
    return this;
};

WSClient.prototype.connect = function(url) {
    this.url = url || this.url;
    this.client.connect(this.url, 'echo-protocol');
    this._initEvents();
    return this;
};

WSClient.prototype.disconnect = function() {
    if (this.connection) {
        this.connection.abort();
    }
    return this;
};

WSClient.prototype.sendData = function(data) {
    var humanSize;
    var stringifyData;
    if (this.client) {
        this.client.send(data);
        stringifyData = JSON.stringify(data);
        humanSize = utils.getStringByteSize(stringifyData);
        console.log('%s: Message was send to "%s", size: %s. Data: %s',
            Date(Date.now()),
            this.url,
            humanSize,
            stringifyData.length > 200? stringifyData.slice(0, 200) + "...": stringifyData);
    }
};

WSClient.prototype._initEvents = function() {
    var inst = this;
    if (this.client) {
        this.client.on('connectFailed', function(error) {
            console.log('Connect Error: ' + error.toString());
        });

        this.client.on('connect', function(connection) {
            inst.connection = connection;
            console.log('WebSocket Client Connected');
            inst.connection.on('error', function(error) {
                console.log("Connection Error: " + error.toString());
            });
            inst.connection.on('close', function() {
                console.log('echo-protocol Connection Closed');
            });
            inst.connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    console.log("Received: '" + message.utf8Data + "'");
                    inst.propertyChange('parser-client', JSON.parse(message.utf8Data));
                }
            });
        });
    }
    return this;
};

module.exports = {
    class: WSClient
};