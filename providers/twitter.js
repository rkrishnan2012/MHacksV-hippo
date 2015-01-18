module.exports.start = function(config) {
	isTwitterAuthenticated = false;
	var client = new Twitter({});
	console.log('twitter start');

	passport.use(new TwitterStrategy({
		consumerKey: config.twitter_consumer_key,
		consumerSecret: config.twitter_consumer_secret,
		callbackURL: config.twitter_callback_url
	}, function(token, tokenSecret, profile, done) {
		console.log('twitter');
		console.log(profile);
		isTwitterAuthenticated = true;
	}));
}