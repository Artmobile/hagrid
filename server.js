var app = require('express').createServer();

app.get('/ping', function(req, res){
	res.send('OK');
});


app.configure(function() {
	// Error handling
	app.use(function(err, req, res, next){
		console.log(err);
	});
});

// Start the http server
var port = process.env.PORT || 3000;

app.listen(port, function(res,req){
	console.log('Started express server...');
});
