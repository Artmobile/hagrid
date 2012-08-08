// T1/server is responsible for getting HTTP requests from clients, 
// sending those requests to T3 via RQ and returning chunked responses to the caller

var express = require('express'),
    app = express(),
	  amqp = require('amqp'),
    config = require('../../config');

//var connection = amqp.createConnection({host:config.T2_ADDRESS});
var hostName = config.T2_ADDRESS;
var exchangeName = config.T2_EXCHANGE_NAME;

console.log("Starting T1 Server...");
var rpc = new (require('./rpc-client'))(); 
var rmqConnection = new (require('../rmq-connection'))(hostName, function(connection){
  rpc.init(connection, exchangeName);
});
rmqConnection.init();

// Sync is a blocking call that processes only one response from T3
// After the first response from T3, the correlation ID is destroyed
/*app.get('/sync/:routingkey/:src/:args', function(req, res){
	//do the actual request. As the library is now it does json/object only
  	rpc.makeRequest(req.params.routingkey, 
      {
        src: req.params.src,
        args: req.params.args
      },
      function response(err, data){
    	if(err)
      		res.send(err.toString())
    	else
      		res.send(JSON.stringify(data.response));
  	});
});*/

app.get('/ping/', function(req, res){
     res.send('preved');
});

app.get('/64/:args', function(req, res){
    res.send(new Buffer(JSON.stringify(req.params.args), 'utf-8').toString('base64'));
});

// Async can handle multiple responses from T3. Correlation ID is held
// until T3 sends finished flag in the RQ message header.
app.get('/work/:src/:args', work);

app.get('/worksql/:args', worksql);

app.get('/workws/:args', workws);

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

  console.log("Work, Got request routingkey - " + req.params.routingkey + ' source - ' + source + ' args - ' + args);
  //do the actual request. As the library is now it does json/object only
  rpc.makeRequest(req.params.routingkey, 
    {
      src: source,
      args: args
    },function response(err, data){
        if(err){
            res.write(err.toString());
            // There is no reason to wait for anymore chunks, end the stream
            res.end();
            return;
          }
        if(data.done == 1){
          //res.write('Done!');
          res.end();
          return
        }
        if(data.error){
          res.write(data.error.toString());
          // There is no reason to wait for anymore chunks, end the stream
          res.end();
          return;
        }
        res.write(JSON.stringify(data.response));
      }, 20000);
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
