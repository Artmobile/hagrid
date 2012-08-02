// T1/server is responsible for getting HTTP requests from clients, 
// sending those requests to T3 via RQ and returning chunked responses to the caller

var app = require('express').createServer(),
	amqp = require('amqp'),
	config = require('../../config');

var connection = amqp.createConnection({host:config.T2_ADDRESS});
var rpc = new (require('./rpc-client'))(connection);

//wait for a proper connection
connection.on("ready", function(){
  console.log("Established connection with the RMQ");
});

// Sync is a blocking call that processes only one response from T3
// After the first response from T3, the correlation ID is destroyed
app.get('/sync/:routingkey/:msg', function(req, res){
	  //do the actual request. As the library is now it does json/object only
  rpc.makeRequest(req.params.routingkey, req.params.msg, function response(err, response){
    if(err)
      res.send(err.toString())
    else
      res.send(JSON.stringify(response.response));
  });


});

// Async can handle multiple responses from T3. Correlation ID is held
// until T3 sends finished flag in the RQ message header.
app.get('/async', function(req, res){

});


app.configure(function() {
	// Error handling
	app.use(function(err, req, res, next){
		console.log(err);
	});
});

// Start the http server
var port = config.T1_PORT;

app.listen(port, function(res,req){
	console.log('Started express server...');
});
