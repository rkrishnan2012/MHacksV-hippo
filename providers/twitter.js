module.exports.start = function(config) {
    isTwitterAuthenticated = false;
    twitterFavs = -1;

    console.log('twitter start');

    passport.use(new TwitterStrategy({
        consumerKey: config.twitter_consumer_key,
        consumerSecret: config.twitter_consumer_secret,
        callbackURL: config.twitter_callback_url
    }, function(token, tokenSecret, profile, done) {
        console.log('twitter');
        console.log(profile);
        isTwitterAuthenticated = true;

        twitterClient = new Twitter({
            consumer_key: config.twitter_consumer_key,
            consumer_secret: config.twitter_consumer_secret,
            access_token_key: token,
            access_token_secret: tokenSecret
        });

        process.nextTick(function() {
            return done(null, profile);
        });
    }));

    setInterval(function(){
    	checkTwitterNotifications()
    }, 10000);

    function checkTwitterNotifications() {
        if (isTwitterAuthenticated) {
            twitterClient.get('favorites/list', function(err, body, res) {
            	console.log(body);
            	console.log(err);
               if(twitterFavs != -1 && body != null && body.length > twitterFavs){
               	console.log("Twitter favorite!");
               }
               else if(body != null){
               	twitterFavs = body.length;	
               }
            });
        }
    }
}