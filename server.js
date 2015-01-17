var express = require('express'),
    passport = require('passport'),
    util = require('util'),
    FacebookStrategy = require('passport-facebook').Strategy,
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    Facebook = require('fb'),
    app = express();

var isFacebookAuthenticated = false;

// Passport session setup.
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
        clientID: config.facebook_api_key,
        clientSecret: config.facebook_api_secret,
        callbackURL: config.callback_url
    },
    function(accessToken, refreshToken, profile, done) {
        Facebook.setAccessToken(accessToken);
        checkFacebookNotifications();
        isFacebookAuthenticated = true;
        process.nextTick(function() {
            return done(null, profile);
        });
    }
));

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

//  Route to setup the facebook authentication
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['manage_notifications']
}));

//  Callback route invoked by facebook upon authentication
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login'
    }),
    function(req, res) {
        res.redirect('/');
    });

//  Logout of all the services
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

function checkFacebookNotifications() {
    Facebook.api('me/notifications', function(res) {
        if (!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }
        console.log(res.data.length);
    });
}

app.listen(3000);