var express = require('express'),
    util = require('util'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    app = express();

SerialPort = require("serialport");
SerialPort.list(function(err, ports) {
    console.log(ports);
    serialPort = new SerialPort.SerialPort(ports[0].comName, {
        baudrate: config.baudrate
    });
    serialPort.on('data', function(data) {
        console.log('data received: ' + data);
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


isSerialPortOpen = false;

isFacebookAuthenticated = false;
isTwitterAuthenticated = false;

Facebook = require('fbgraph');
//Facebook = require('fb')
FacebookStrategy = require('passport-facebook').Strategy;
Twitter = require('twitter');
TwitterStrategy = require('passport-twitter').Strategy;

passport = require('passport');
request = require('request'); 

// Passport session setup.
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


app.use("/public", express.static(__dirname + '/public'));
app.use("/js", express.static(__dirname + '/public/js'));
app.use("/styles", express.static(__dirname + '/public/styles'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use("/font", express.static(__dirname + '/public/font'));


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

app.post('/webui', function(req, res) {
    var string = req.body.text;
    console.log(string);
    if(isSerialPortOpen){
        serialPort.write(string, function(err, results) {
            console.log(results);
            console.log(err);
        });    
    }
});

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
        console.log('facebook done');
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



app.listen(3000);