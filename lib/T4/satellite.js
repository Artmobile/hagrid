var RequestHandler = require('../T3/request-handler');
console.log('Sattellite - Satellite proccess  started');

process.on('message', function(mes) {
  //console.log('CHILD got message:', mes);
  var handler = new RequestHandler(mes.data, mes.correlationId, mes.responseQueue);

	handler.handle(
		// on Response
		function(data, err, correlationId, responseQueue){
			process.send({ 
					data: data,
					err: err,
					correlationId: correlationId,
					responseQueue: responseQueue
			 });
		}
	);//end of handle
}); //end of procedd.on
