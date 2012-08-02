// T1/server is responsible for getting HTTP requests from clients, 
// sending those requests to T3 via RQ and returning chunked responses to the caller

var app = require('express').createServer(),
	config = require('../../config');

// Sync is a blocking call that processes only one response from T3
// After the first response from T3, the correlation ID is destroyed
app('/sync', function(req, res){

});

// Async can handle multiple responses from T3. Correlation ID is held
// until T3 sends finished flag in the RQ message header.
app('/async', function(req, res){

});


app.configure(function() {
	// Error handling
	app.use(function(err, req, res, next){
		console.log(err);
	});
});

// Start the http server
var port = config.T1-PORT;

app.listen(port, function(res,req){
	console.log('Started express server...');
});
