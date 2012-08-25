var RequestHandler = require('./request-handler');
console.log('Sattellite - Satellite proccess  started');

process.on('message', function(mes) {
  //console.log('CHILD got message:', mes);
  var handler = new RequestHandler(mes.data, mes.correlationId, mes.responseQueue);

	handler.handle(
		// on Response
		function(data, err, correlationId, responseQueue){
			//console.log("Sattelite, on callback, err.code - " + err.code + " err message- " + err.message);
			process.send({ 
					data: data,
					err: err ? {code: err.code, message: err.message} : null,
					correlationId: correlationId,
					responseQueue: responseQueue
			 });
		}
	);//end of handle
}); //end of procedd.on
