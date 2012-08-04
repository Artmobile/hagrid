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
						console.log("Received message, routing key - " + deliveryInfo.routingKey + " message "  + message);
						onMessage(message, m.replyTo, m.correlationId);
						//console.log("Data was sent to processs");
					});
				});
			});
		},
		sendResponse: function(result, responseQueue, correlationId){
			if(responseQueue == null || responseQueue === 'undefined'){
				return;
			}
			//console.log("Sending response to queue - " + responseQueue + " correlationID - " + correlationId);
			rmq_connection.publish(responseQueue, result,
				{
				    contentType:'application/json',
				    correlationId:correlationId
				});
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
