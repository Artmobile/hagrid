// T1/server is responsible for getting HTTP requests from clients, 
// sending those requests to T3 via RQ and returning chunked responses to the caller

var express = require('express'),
    app = express(),
	  amqp = require('amqp'),
    config = require('../../config');

//var connection = amqp.createConnection({host:config.T2_ADDRESS});
var hostName = config.T2_ADDRESS;
var exchangeName = config.T2_EXCHANGE_NAME;
var responseTimeout = config.RESPONSE_TIMEOUT;

console.log("Starting T1 Server...");
var rpc = new (require('./rpc-client'))(); 
var rmqConnection = new (require('../rmq-connection'))(hostName, function(connection){
  rpc.init(connection, exchangeName);
});
rmqConnection.init();

// Sync is a blocking call that processes only one response from T3
// After the first response from T3, the correlation ID is destroyed
app.get('/ping/', function(req, res){
     res.send('preved');
});


// timeout in Seconds
app.get('/work/:src/:args/:timeout', work);

app.get('/worksql/:args/:timeout', worksql);

app.get('/workws/:args/:timeout', workws);

function worksql(req, res){
  req.params.routingkey = 'SQL';
  work(req, res);
}
function workws(req, res){
  req.params.routingkey = 'WS';
  work(req, res);
}
function work(req, res){
  if(req.params.routingkey === undefined){
        req.params.routingkey = 'GENERIC';
  }
  var source = config.WORKERS[req.params.routingkey].SRC || req.params.src;
  var args = new Buffer(JSON.stringify(req.params.args), 'base64').toString('utf-8');
  var timeout = req.params.timeout * 1000 || responseTimeout;
  
  console.log("Work, Got request routingkey - " + req.params.routingkey + ' source - ' + source + ' args - ' + args);
  //do the actual request. As the library is now it does json/object only
  rpc.makeRequest(req.params.routingkey, 
    {
      src: source,
      args: args,
      timeout: timeout
    },response, timeout);

   function response(data, err){
     //console.log("Ti on response, data - " + data  + ", error - " + err + " data.error.code - " + data.err.code);
        if(err){
            res.send(err.toString());
            return;
          }
        if(data.err){
          res.send(data.err.message);
          return;
        }
        res.send(JSON.stringify(data.response));
  };
}

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
