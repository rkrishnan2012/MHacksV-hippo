module.exports.start = function(config) {
    isFacebookAuthenticated = false;
    totalNotifications = -1;
    totalInbox = -1;
    console.log('FACEBOOK');
    // Use the FacebookStrategy within Passport.
    passport.use(new FacebookStrategy({
            clientID: config.facebook_api_key,
            clientSecret: config.facebook_api_secret,
            callbackURL: config.facebook_callback_url
        },
        function(accessToken, refreshToken, profile, done) {
            Facebook.setAccessToken(accessToken);
            console.log("Access Token: " + accessToken);
            isFacebookAuthenticated = true;
            checkFacebookNotifications(config);
            process.nextTick(function() {
                return done(null, profile);
            });
        }
    ));

    setInterval(function() {
        checkFacebookNotifications(config);
    }, 5000);
}

function checkFacebookNotifications(config) {
    if (isFacebookAuthenticated) {
        Facebook.get('me/notifications', function(err, res) {
            if (!res || res.error) {
                console.log(!res ? 'error occurred' : err);
                return;
            }
            if (totalNotifications < res.data.length && totalNotifications >= 0) {
                console.log("New notification!");
            }
            totalNotifications = res.data.length;
        });

        Facebook.get('me/inbox?fields=unread', function(err, res) {
            if (!res || res.error) {
                console.log(!res ? 'error occurred' : err);
                return;
            }

            var unread = 0;
            for(message in res.data){
            	unread += res.data[message].unread;
            }
            
            if(totalInbox < unread && unread >= 0){
            	console.log("New Message Arrived!");
            }
            totalInbox = unread;
        });
    }
}