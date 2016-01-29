var prop = require('./prop.json');
var userApp = require('./app');
var express = require('express');
var fs = require('fs');
var server = null;
var sslOptions = null;
if (prop.network.ssl.active === true) {
    server = require('https');
    sslOptions = {
        key: fs.readFileSync(prop.network.ssl.path + '/server.key'),
        cert: fs.readFileSync(prop.network.ssl.path + '/server.crt')
    }
} else {
    server = require('http');
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
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           //process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
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
            console.log('%s: HTTPS server successfully created.', Date(Date.now()));
        } else {
            self.app = server.createServer(userApp);
            console.log('%s: HTTP server successfully created.', Date(Date.now()));
        }
        var wsServer = require('./public/js/common/WSServer').instance(self.app);
        require('./public/js/common/WSTest').run(wsServer);
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
        self.app.listen(prop.network.ssl.active? self.httpsPort: self.port,
            self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, prop.network.ssl.active? self.httpsPort: self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

