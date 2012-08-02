// process arguments:
// argv[2] - REST port, default = 3000
// argv[3] - Rabbit hostname, default = localhost
// argv[4] - Worker ID, default - 1
// argv[5] - Worker type

var RMQ 	= require("./rpc-server"),
	config = require('../../config'),
	amqp 		= require('amqp');

var rmqServer = new RMQ();	

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
var routingKey = process.argv[2];


// Get the prefetch count for the desired worker. This defines
// how many parallel requests each worker can handle
var prefetchCount = config.WORKERS[routingKey].PREFETCH_COUNT;

//Main function
function onMessage(data, responseQueue, correlationId) {
	// Got Message from the RQ (coming from T1)
	// Here we need to extract worker name, get the args and send
	// all that to the worker

	// Just a litle plumbing test - simulate process running for 1 second and return
	setTimeout(function(){

		// Returns some response to a caller
		rmqServer.sendResponse('{\'data\': \'Hello, world!\'}', responseQueue, correlationId);

		// We are ready for the next request
		rmqServer.shiftRequest();
	}, 1000);
};

global.onConnectionError = function(e) {
  console.log('connection error. exception - ' + e);
};

//in case of connection closing, start initialization again
global.onConnectionClose = function(e) {
  console.log('connection closed.' + e);
  initRmqServer();
};


var connection;
function initRmqServer(){
	// Create a static connection
	console.log('initrmqServer started, hostName - ' + hostName);
	connection = amqp.createConnection({ host: hostName });
	console.log('initrmqServer Connection created');

	connection.addListener('error', global.onConnectionError);
	connection.addListener('close', global.onConnectionClose);
	
	// Initialize the rmqServer
	rmqServer.init(connection, exchangeName, routingKey, onMessage, prefetchCount);	
	console.log('initrmqServer rmqServer initialized');
};	

//Start Rabbit MQ Server
initRmqServer();


