
var path = require('path');

WebServer = function() {
    var fs = require("fs");
    this.app = require('express')();
    this.transport;
    this.props = {
        "network": {
            "host": "127.0.0.1",
            "http": 8080,
            "https": 8443,
            "ssl": {
                "active": true,
                "path": "/ssl"
            }
        }
    };
    this.props.network.ssl.cert = {
        key: fs.readFileSync(this.props.network.ssl.path + '/server.key'),
        cert: fs.readFileSync(this.props.network.ssl.path + '/server.crt')
    };
};

WebServer.prototype.init = function(props) {
    //this.props = Object.assign(this.props, props);
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
    server.listen(inst.props.network.http, inst.props.network.host, function () {
        console.log('%s: Node server started on %s:%d ...', Date(Date.now()), inst.props.network.host, inst.props.network.http);
    });
    console.log('%s: HTTP server successfully created.', Date(Date.now()));
};

WebServer.prototype._initHTTPS = function() {
    var inst = this;
    inst.transport = require('https');
    inst.port = inst.props.network.https || 8443;
    inst.app.set('port', inst.port);
    inst.server = inst.transport.createServer(inst.props.network.ssl.cert, inst.app);
    inst.server.listen(inst.props.network.https, inst.props.network.host, function () {
        console.log('%s: Node server started on %s:%d ...', Date(Date.now()), inst.props.network.host, inst.props.network.https);
    });
    console.log('%s: HTTPS server successfully created.', Date(Date.now()));
};

WebServer.prototype._initEvents = function() {
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
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
};

module.exports = {
    class: WebServer
};
