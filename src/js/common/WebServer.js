var path = require('path');
var fs = require("fs");
var utils = require('global').utils;
var log = require('global').log;

WebServer = function() {
    this.app = require('express')();
    this.transport;
    this.props = {
        "network": {
            "host": "127.0.0.1",
            "http": 8080,
            "https": 8443,
            "ssl": {
                "active": false,
                "path": "/ssl"
            }
        }
    };
};

WebServer.prototype.init = function(props) {
    this.props = utils.merge(this.props, props);
    return this;
};

WebServer.prototype.start = function() {
    if (this.props.network.ssl.active) {
        this._initHTTPS();
    } else {
        this._initHTTP();
    }
    return this;
};

WebServer.prototype._initHTTP = function() {
    var inst = this;
    inst.transport = require("http");
    inst.port = inst.props.network.http || 8080;
    inst.server = inst.transport.createServer(inst.app);
    inst.app.set('port', this.port);
    inst.server.listen(inst.props.network.http, inst.props.network.host, function () {
        log.info('Node server started on %s:%d ...', inst.props.network.host, inst.props.network.http);
    });
    log.info('HTTP server successfully created.');
};

WebServer.prototype._initHTTPS = function() {
    var inst = this;
    inst.transport = require('https');
    inst.port = inst.props.network.https || 8443;
    inst.app.set('port', inst.port);
    inst.server = inst.transport.createServer(inst._getCertFiles(), inst.app);
    inst.server.listen(inst.props.network.https, inst.props.network.host, function () {
        log.info('Node server started on %s:%d ...', inst.props.network.host, inst.props.network.https);
    });
    log.info('%s: HTTPS server successfully created.');
};

WebServer.prototype._initEvents = function() {
    var inst = this;
    this.server.on('error', onError);
    this.server.on('listening', onListening);

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                log.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                log.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    function onListening() {
        var addr = inst.server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
};

WebServer.prototype._getCertFiles = function(pack) {
    return {
        key: fs.readFileSync(this.props.network.ssl.path + '/server.key'),
        cert: fs.readFileSync(this.props.network.ssl.path + '/server.crt')
    }
};

module.exports = {
    class: WebServer
};
