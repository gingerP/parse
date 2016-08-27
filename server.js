global._req = require('app-root-path').require;
var prop = require('./prop.json');
var userApp = require('./app');
var express = getApp();
var fs = require('fs');
var server = null;
var sslOptions = null;
var logger = _req('src/js/logger').create('SERVER');
if (prop.network.ssl.active === true) {
    server = require('https');
    sslOptions = {
        key: fs.readFileSync(prop.network.ssl.path + '/server.key'),
        cert: fs.readFileSync(prop.network.ssl.path + '/server.crt'),
        rejectUnauthorized: false
    }
} else {
    server = require('http');
}

function getApp() {
    var app;
    process.argv.forEach(function (val, index, array) {
        var appScript;
        if (val.indexOf('app=') == 0) {
            appScript = val.split('app=');
            app = require(appScript[1]);
        }
    });
    if (!app) {
        var app = require('./app');
    }
    return app;
}

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = prop.network.host;
        self.port      = prop.network.http;
        self.httpsPort = prop.network.https;
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
            logger.info('Received %s - terminating sample app ...', sig);
           //process.exit(1);
        }
        logger.info('Node server stopped.');
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        if (prop.network.ssl.active === true) {
            self.app = server.createServer(sslOptions, userApp);
            logger.info('HTTPS server successfully created.');
        } else {
            self.app = server.createServer(userApp);
            logger.info('HTTP server successfully created.');
        }
        var wsServer = require('./src/js/common/WSServer').instance(self.app);
        require('./src/js/common/WSTest').run(wsServer);
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        var protocol = prop.network.ssl.active ? 'htpps' : 'http';
        var port = prop.network.ssl.active? self.httpsPort: self.port;
        self.app.listen(port, self.ipaddress, function () {
              logger.info('Node server started on %s://%s:%s', protocol, self.ipaddress, port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

