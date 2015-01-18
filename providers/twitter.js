module.exports.start = function(config) {
	isTwitterAuthenticated = false;
	console.log('twitter start');

	/*passport.use(new TwitterStrategy({
		consumerKey: config.twitter_consumer_key,
		consumerSecret: config.twitter_consumer_secret,
		callbackURL: config.twitter_callback_url
	}, function(token, tokenSecret, profile, done) {
		console.log('twitter');
		console.log(profile);
		isTwitterAuthenticated = true;

		process.nextTick(function() {
            return done(null, profile);
        });
	})); */

	/*var client = new Twitter({
		consumer_key: config.twitter_consumer_key,
		consumer_secret: config.twitter_consumer_secret,
		access_token_key: config.access_token_key,
		access_token_secret: config.access_token_secret
	});

	client.get('favorites/list', function(err, body, res){
		if (err)
			console.log(err);

		console.log(body);
		console.log('------------');
		//console.log(res);
	});*/
	

}