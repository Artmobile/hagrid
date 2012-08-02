var app = require('express').createServer();

app.get('/ping', function(req, res){
	res.write('Got your request \n');
	res.write('Your number in Q is 8. Wait for response ... \n');
	setTimeout(function(){
		res.write('Here we are! \n');
		res.end();
}, 10000);
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
