// process arguments:
// argv[2] - REST port, default = 3000
// argv[3] - Rabbit hostname, default = localhost
// argv[4] - Worker ID, default - 1
// argv[5] - Worker type

var RMQ 	= require("./rpc-server"),
	config = require('../../config'),
	async = require('async'),
	RequestHandler = require('./request-handler'),
	amqp 		= require('amqp');
	


// The worker details will be partially coming from the Procfile like in the example below:
//
// worker: node T3/server.js  	WS
// worker: node T3/server.js  	GENERIC
// worker: node T3/server.js 	SQL
//
// Som parameters will be taken from the config.js file. NOte that the config.js WORKERS should
// contain same entries as passed in the Procfile (WS,SQL, GENERIC, CUSTOM1, CUSTOM2 etc)
	
var exchangeName = config.T2_EXCHANGE_NAME;
var hostName = config.T2_ADDRESS;
var routingKey = process.argv[2] || 'SQL';


// Get the prefetch count for the desired worker. This defines
// how many parallel requests each worker can handle
var prefetchCount = config.WORKERS[routingKey].PREFETCH_COUNT;

//Main function
//TODO imlement timeout
function onMessage(data, responseQueue, correlationId) {
	// Got Message from the RQ (coming from T1)
	// Here we need to extract worker name, get the args and send
	// all that to the worker

	var handler = new RequestHandler(data, correlationId, responseQueue);

	handler.handle(
		// on Data
		function(result, correlationId, responseQueue){
			rmqServer.sendResponse({
				response:result,
				done:0
			}, responseQueue, correlationId);
		},
		// onError
		function(err, correlationId, responseQueue){
			rmqServer.sendResponse({
				error: err,
				done:0
			}, responseQueue, correlationId);

		},
		// done
		function(correlationId, responseQueue){
			//
			console.log('Done, correlationID - ' + correlationId);
			rmqServer.sendResponse({
				done:1
			}, responseQueue, correlationId);

			//only on done shift for new request
			rmqServer.shiftRequest();
		}
	);
};
console.log("Starting T3 Server...");
var rmqServer = new RMQ();	
var rmqConnection = new (require('../rmq-connection'))(hostName, function(connection){
	rmqServer.init(connection, exchangeName, routingKey, onMessage, prefetchCount);	
});
rmqConnection.init();

