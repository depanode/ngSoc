/*
 *created by deparus
 */

var express           = require('express');
var path              = require('path');
var favicon           = require('serve-favicon');
var logger            = require('morgan');
var cookieParser      = require('cookie-parser');
var bodyParser        = require('body-parser');
var expressValidator  = require('express-validator');
var mongoose          = require('mongoose');
var passport          = require('passport');
var jwt               = require('express-jwt');

var env = process.env.NODE_ENV || 'development';

require('./models/Posts');
require('./models/Comments');
require('./models/User');
require('./models/tempUser');
require('./models/Chat');
require('./models/Message');
require('./models/Invitation');
require('./models/Passrestore');
require('./config/passport');

var config = require('./config/' + env);

mongoose.connect(config.database);

var routes = require('./routes/index');
var posts = require('./routes/posts');
var users = require('./routes/users');
var admin = require('./routes/admin');

var auth = jwt({secret: config.secret, userProperty: 'payload'});
var onlyAdmin = function(req, res, next) {
  if (req.payload && req.payload.isAdmin) {
    return next();
  }
  res.status(401).send();
};

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', routes);
app.use('/posts', auth, posts);
app.use('/users', auth, users);
app.use('/admin', auth, onlyAdmin, admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
