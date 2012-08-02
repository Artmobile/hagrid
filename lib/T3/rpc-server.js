var amqp 		= require('amqp');
var requestQueueName 	= "worker_queue";



var RabbitMqServer = function(){
	var request_queue, rmq_connection;

	// Public method
	return {
		init: function(connection, exchangeName, routingKey, onMessage, prefetchCount){
			console.log("Started RMQ initialization on exchange - " + exchangeName + ", routing key - " + routingKey + ", prefetchcount - " + prefetchCount);
			rmq_connection = connection;
			connection.on('ready', function(){
				exchange = connection.exchange(exchangeName, {type: 'direct'});
				
				console.log("On connection - exchange created");
				
				// Create the queue now
				connection.queue(requestQueueName, { autoDelete: true, durable: false, exclusive: false }, function(queue){
					request_queue = queue;
					queue.bind(exchange, routingKey);

					console.log("RMQ server started listening for commands...");
					
					queue.subscribe( {ack:true, prefetchCount: prefetchCount}, function(message, headers, deliveryInfo, m){

						if(!message){
							processData('The message has been returned empty', m.replyTo, m.correlationId);
							return;
						}
						var data = message.data.toString();


						console.log("Received message, routing key - " + deliveryInfo.routingKey + " message "  + data);
						console.log("m - " + m + "  correlationID - " + m.correlationId + " reply to - " + m.replyTo);

						onMessage(message, m.replyTo, m.correlationId);
						console.log("Data was sent to processs");
						//queue.shift();	
			
					});
				});
			});
		},
		sendResponse: function(result, responseQueue, correlationId){
			console.log("Sending response to queue - " + responseQueue + " correlationID - " + correlationId);
			rmq_connection.publish(responseQueue, {response: result}, {
			    contentType:'application/json',
			    correlationId:correlationId
			});
			//requestQueue.shift();	
		},
		shiftRequest: function(){
			request_queue.shift();
		}
	};
}

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = RabbitMqServer;
}
