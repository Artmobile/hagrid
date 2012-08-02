var path = require('path');

function make_path(workerpath){
	var root = path.resolve('/' + path.relative('/'));

	return path.normalize(root + workerpath);
}

var RequestHandler = function(data, correlationId, responseQueue){
	return {
		handle: function(onData, onError, done){
			var worker_path = make_path(data.src);

			var Worker = require(worker_path);

			var worker = new Worker(data.args);

			var _done = done,
				_onData = onData,
				_onError = onError;

			worker.exec(
				function(result){
					_onData(result, correlationId, responseQueue);
				},
				// onError
				function(err){
					_onError(err, correlationId, responseQueue);
				},
				// done
				function(){
					_done(correlationId, responseQueue);
				}

			);
		}		

	}
}

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = RequestHandler;
}
