var im = {
  session: require('express-session'),
  express: require('express'),
  path: require('path'),
  favicon: require('serve-favicon'),
  logger: require('morgan'),
  cookieParser: require('cookie-parser'),
  bodyParser: require('body-parser'),
  InitDB: require('./public/js/db/InitDBM'),
  env: require('./public/js/env'),
  flash: require('connect-flash')
};
var app = im.express();
//Init DB
console.info("Init DB");
new im.InitDB().initUsers();
/*new im.InitDB().validate(function() {
    console.info("Init DB data");
});*/
im.env.init();
//
// view engine setup
/*app.set('views', im.path.join(__dirname, 'views'));
app.set('view engine', 'jade');*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(im.logger('dev'));
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
    saveUninitialized: false}));

var controllerApi = require('./controller-api').init(app);
var controllerAdminApi = require('./controller-admin').init(app);
var controllerPages = require('./controller-pages').init(app);

//app.use(im.express.static(im.path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
            });

// error handlers

/*
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log('error ' + (err.status || 500))
//    res.status(err.status || 500);

/!*    res.render('error', {
      message: err.message,
      error: err
    });*!/
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log('error ' + (err.status || 500))
  //res.status(err.status || 500);
/!*  res.render('error', {
    message: err.message,
    error: {}
  });*!/
});
*/


module.exports = app;
