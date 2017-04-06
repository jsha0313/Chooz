var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var request = require('request');

app.listen(8000, function() {
	console.log('listening on port 8000');
});

// required to parse request body
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '/www', 'index.html'));
});

app.get('/tax', function (req, res) {
	var options = { 
					method: 'GET',
	  				url: 'https://taxrates.api.avalara.com/postal',
	  				qs: { country: 'usa',
	     				postal: req.query.zipcode,
	     				apikey: 'Tqr5gkFA6OnIbeAcMGOSywDuuim5yPZenHP+fwiXTHPA0rUiTLxksbRHQj9m+GvkYCibsdDVhuiaoFEr/7aGOg==' 
	     			},
	  				headers: {
	  						'Access-Control-Allow-Origin': '*',
	  						'cache-control': 'no-cache' 
	  				}
	     		};	

	request(options, function (error, response, body) {
		if (error) {
			res.json(error);
		} else {
			res.json(body);
		}
	});
});


app.use(express.static(__dirname + '/www'));
