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

			var ident = '0t';
			var string = ident + temp;
			notify(string);
			console.log(temp);

			ident = '0g';
			var string = ident + general;
			notify(string);
			console.log(general);

			ident = '0i';
			var string = ident + specific;
			notify(string);
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

			var ident = '1t';
			var string = ident + temp;
			notify(string);
			console.log(temp);

			ident = '1g';
			var string = ident + general;
			notify(string);
			console.log(general);

			ident = '1i';
			var string = ident + specific;
			notify(string);
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
// clear
// extreme
// additional


function notify(str) {
    if (isSerialPortOpen) {
        console.log("Sending push notification.");
        serialPort.write(str, function(err, results) {});
    } else {
        console.log("Port is not yet open. ");
        serialPort.list(function(err, ports) {
            ports.forEach(function(port) {
                console.log(port.comName);
                console.log(port.pnpId);
                console.log(port.manufacturer);
            });
        });
    }
} 