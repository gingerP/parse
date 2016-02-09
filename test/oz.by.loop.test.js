var fs = require('fs');
var server = null;
var sslOptions = null;
var userApp = iniExpress();
var server = require('http');

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
        self.app = server.createServer(userApp);
        console.log('%s: HTTP server successfully created.', Date(Date.now()));
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(11111, '0.0.0.0', function () {
                console.log('%s: Node server started on %s:%d ...',
                    Date(Date.now()), '0.0.0.0', 11111);
            });
    };

};   /*  Sample Application.  */

function iniExpress() {
    var im = {
        session: require('express-session'),
        express: require('express'),
        path: require('path'),
        favicon: require('serve-favicon'),
        logger: require('morgan'),
        cookieParser: require('cookie-parser'),
        bodyParser: require('body-parser'),
        flash: require('connect-flash')
    };
    var app = im.express();
    app.use(im.bodyParser.json());
    app.use(im.bodyParser.urlencoded({ extended: true }));
    app.use(im.flash());
    app.use(im.session({
        cookie: {
            maxAge: null,
            secure: true
        },
        secret: 'woot',
        resave: false,
        saveUninitialized: false}
    ));
    app.get('/*', function(req, res) {
        res.sendFile(__dirname + '/oz.by.html');
    });
    return app;
}


/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

