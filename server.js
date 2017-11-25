var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var cons = require('consolidate');
var flash = require('connect-flash');
var app = express();

//require('./config/passport')(passport);
var route = require('./app/routes.js');

app.engine('html', cons.swig);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'html');

app.use(express.static(__dirname + ''));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  req.headers['if-none-match'] = 'no-match-for-this';
  next();
});

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.use(express.static(path.join(__dirname, '/')));

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 3000000 }
}));


app.use(passport.initialize());
app.use(passport.session());

app.use('/', route);

app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.get('*', function(req, res){
  res.status(404).send('Page Not Found');
});



app.listen(8080);
console.log("Listening to the port 8080");
module.exports = app;
