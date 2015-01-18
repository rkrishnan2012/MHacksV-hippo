var express = require('express'),
    util = require('util'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    app = express();

SerialPort = require("serialport");
SerialPort.list(function(err, ports) {
    /*ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });*/
    serialPort = new SerialPort.SerialPort(ports[0].comName, {
        baudrate: config.baudrate
    });
    serialPort.open(function(error) {
        if (error) {
            console.log('failed to open: ' + error);
        } else {
            console.log("Serial port opened.");
            isSerialPortOpen = true;
        }
    });
});

/**/

isSerialPortOpen = false;

/**/

Facebook = require('fbgraph');
FacebookStrategy = require('passport-facebook').Strategy;

passport = require('passport');

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

var normalizedPath = require("path").join(__dirname, "providers");

require("fs").readdirSync(normalizedPath).forEach(function(file) {
    require("./providers/" + file).start(config);
});


app.listen(3000);