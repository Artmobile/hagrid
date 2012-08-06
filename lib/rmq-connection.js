var amqp 		= require('amqp');

var RabbitMqConnection = function(hostName, callback){
		var _callback = callback;
		var _hostName = hostName;
		
	function connect(){
		console.log('RabbitMqConnection started, hostName - ' + _hostName);
		connection = amqp.createConnection({ host: _hostName });
		console.log('RabbitMqConnection succesfully connected to Rabbit MQ');

		connection.addListener('error', onConnectionError);
		connection.addListener('close', onConnectionClose);
			
		if(_callback)
			_callback(connection);
		};
	function onConnectionClose(e){	
		var timeout = 5000;
		console.log('onConnectionClose, exception - ' + e + ' Start reconnection in ' + timeout + ' ms');
		setTimeout(function(){
        	connect();    
        }, timeout);
		
		};
	function onConnectionError(e) {
  		console.log('onConnectionError, exception - ' + e);
		};		
	return {
		init: function(){
			connect();
		}
	}; //end of return
}// end of class

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = RabbitMqConnection;
}

