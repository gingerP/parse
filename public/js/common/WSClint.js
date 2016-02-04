var utils = require('../utils');
var SockJS = require('sockjs');
var Observable = require('../common/Observable').class;

WSClient = function(url) {
    this.url = url;
    this.sock;
};

WSClient.prototype = Object.create(Observable.prototype);
WSClient.prototype.constructor = WSClient;

WSClient.prototype.connect = function(url) {
    this.url = url || this.url;
    this.sock = new SockJS(this.url);
    this._initEvents();
    return this;
};

WSClient.prototype.disconnect = function() {
    this.sock.close();
    return this;
};

WSClient.prototype.sendData = function(data) {
    var humanSize;
    var stringifyData;
    if (this.sock) {
        this.sock.send(data);
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
    if (this.sock) {
        this.sock.onopen = function() {
            console.log('%s: Successfully connected to %s.', Date(Date.now()), this.url);
        };
        this.sock.onmessage = function(e) {
            console.log('%s: Take message from %s. Message: %s',
                Date(Date.now()),
                inst.url,
                JSON.stringify(e.data)
            );
            inst.propertyChange("income", e.data);
        };
        this.sock.onclose = function() {
            console.log('%s: Connection with %s was closed.', Date(Date.now()), this.url);
        };
    }
    return this;
};

module.exports = {
    class: WSClient
};