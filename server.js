var express = require('express'),
    util = require('util'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    Facebook = require('fb'),
    app = express();

var isFacebookAuthenticated = false;
var isTwitterAuthenticated = false;

Facebook = require('fbgraph');
FacebookStrategy = require('passport-facebook').Strategy;
TwitterStrategy = require('passport-twitter').Strategy;

passport = require('passport');
request = require('request'); 
Twitter = require('twitter');

// Passport session setup.
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: true,
    key: 'sid'
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

//Router code
app.get('/', function(req, res) {
    res.render('index', {
        user: req.user,
        isFacebookAuthenticated: isFacebookAuthenticated
    });
});

app.get('/testSiteVisits', function(req, res) {
    res.render('websiteCounter', {});
});

app.get('/webHit', function(req, res) {
  console.log("HIT!");
  res.end();
});

//  Route to setup the facebook authentication
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['manage_notifications', 'read_mailbox']
}));

//  Callback route invoked by facebook upon authentication
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login'
    }),
    function(req, res) {
        res.redirect('/');
    }
);

// route to set up twitter auth
app.get('/auth/twitter', passport.authenticate('twitter'));

// callback route invoked by twitter
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login' })
);

//  Logout of all the services
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// access weather info
app.get('/weather', function(req, res) {
    console.log('weather');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

var normalizedPath = require("path").join(__dirname, "providers");

require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./providers/" + file).start(config);
});


function streamTwitter() {
    //twClient.stream('user/')
}

app.listen(3000);