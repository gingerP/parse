var im = {
  express: require('express'),
  path: require('path'),
  favicon: require('serve-favicon'),
  logger: require('morgan'),
  cookieParser: require('cookie-parser'),
  bodyParser: require('body-parser')
}
var app = im.express();
var controllerApi = require('./controller-api').init(app);

// view engine setup
/*app.set('views', im.path.join(__dirname, 'views'));
app.set('view engine', 'jade');*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(im.logger('dev'));
app.use(im.bodyParser.json());
app.use(im.bodyParser.urlencoded({ extended: true }));
app.use(im.cookieParser());
//app.use(im.express.static(im.path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
