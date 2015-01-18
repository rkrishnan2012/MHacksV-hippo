module.exports.start = function(config) {
	// coordinates for tallahassee
	var cordURL = 'lat=30.44&lon=-84.28';
	var apiURL = '&APPID=' + config.weather_api_key;
	var url = cordURL + apiURL;
	getCurrentForecast(url);
	getTomorrowForecast(url);
}

// only call once every ten minutes
function getCurrentForecast(url){
	var baseURL = 'http://api.openweathermap.org/data/2.5/weather?';
	url = baseURL + url;
	request(url, function(err, res, body){
		if (!err && res.statusCode == 200){
			var city = JSON.parse(body);
			var weather = city.weather[0];
			var general = weather.main;
			var specific = weather.id;
			var temp = city.main.temp - 272.15;

			console.log(temp);
			console.log(general);
			console.log(specific);
			setTimeout(getCurrentForecast, 600000);
		} else {
			console.log(err);
			console.log(res.statusCode);
			// 10 minutes
			setTimeout(getCurrentForecast, 600000);
		}
	});
}

function getTomorrowForecast(url){
	var baseURL = 'http://api.openweathermap.org/data/2.5/forecast/daily?';
	var forecastURL = '&cnt=2&mode=json';
	url = baseURL + url + forecastURL;

	request(url, function(err, res, body){
		if (!err && res.statusCode == 200){
			var city = JSON.parse(body);
			var weather = city.list[1].weather[0];
			var general = weather.main;
			var specific = weather.id;
			var temp = city.list[1].temp.day - 272.15;

			console.log(temp);
			console.log(general);
			console.log(specific);
			setTimeout(getTomorrowForecast, 600000);
		} else {
			console.log(err);
			console.log(res.statusCode);
			// 10 minutes
			setTimeout(getTomorrowForecast, 600000);
		}
	});
}


// list of weather conditions & more accurate 
// id's http://openweathermap.org/weather-conditions
// 
// GENERAL
// ------------
// thunderstorm
// drizzle
// rain
// snow 
// atmosphere
// clouds
// extreme
// additional
