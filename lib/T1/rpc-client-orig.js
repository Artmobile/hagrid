var amqp = require('amqp')
  , crypto = require('crypto')
  , config = require('../../config');

var TIMEOUT=2000; //time to wait for response in ms
var CONTENT_TYPE='application/json';

//exports = module.exports = AmqpRpc;

function RabbitMqClient(connection, exchangeName){
  var self = this;
  this.connection = typeof(connection) != 'undefined' ? connection : amqp.createConnection();
  connection.on('ready', function(){
    self.exchange = connection.exchange(exchangeName, {type: 'direct'});
    console.log('Exchange created succesfully');
  });

  this.requests = {}; //hash to store request in wait for response
  this.response_queue = false; //plaseholder for the future queue
}

RabbitMqClient.prototype.makeRequest = function(routing_key, content, callback, timeout){
  var self = this;
  //generate a unique correlation id for this call
  var correlationId = crypto.randomBytes(16).toString('hex');

  //create a timeout for what should happen if we don't get a response
  var tId = setTimeout(function(corr_id){
    //if this ever gets called we didn't get a response in a 
    //timely fashion
    callback(new Error("timeout " + corr_id));
    //delete the entry from hash
    delete self.requests[corr_id];
  }, timeout ? timeout : TIMEOUT, correlationId);

  //create a request entry to store in a hash
  var entry = {
    callback:callback,
    timeout: tId //the id for the timeout so we can clear it
  };

  //put the entry in the hash so we can match the response later
  self.requests[correlationId]=entry;

  //make sure we have a response queue
  self.setupResponseQueue(function(){
	//put the request on a queue
	self.exchange.publish(routing_key, content,
		{
			correlationId:correlationId,
			contentType:CONTENT_TYPE,
			replyTo:self.response_queue
		}); 
  });
}


RabbitMqClient.prototype.setupResponseQueue = function(next){
  //don't mess around if we have a queue
  if(this.response_queue) return next();

  var self = this;
  //create the queue
  self.connection.queue('', {exclusive:true}, function(q){  

    //store the name
    self.response_queue = q.name;

    //subscribe to messages
    q.subscribe(function(message, headers, deliveryInfo, m){
	      //get the correlationId
	      var correlationId = m.correlationId;

      	//is it a response to a pending request
		if(correlationId in self.requests){
			//retreive the request entry
			var entry = self.requests[correlationId];

			if(message.done == 1){

				//make sure we don't timeout by clearing it
				clearTimeout(entry.timeout);

				//delete the entry from hash
				delete self.requests[correlationId];
			}

	        //callback, no err
	        entry.callback(null, message);
		}
    });
    return next();    
  });
}

if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = RabbitMqClient;
}