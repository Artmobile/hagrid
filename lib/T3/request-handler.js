var path = require('path');

function make_path(workerpath){
	var root = path.resolve('/' + path.relative('/'));

	return path.normalize(root + '/workers/' + workerpath);
}

var RequestHandler = function(data, correlationId, responseQueue){
	return {
		handle: function(callback){
			var worker_path = make_path(data.src);
			//console.log("worker path  - " + worker_path);
			var Worker = require(worker_path);

			var worker = new Worker(data.args);

			var _callback = callback;

			worker.exec(
				function(res, err){
					_callback(res, err, correlationId, responseQueue);
				}
			);
		}//end of handle
	}// end of return
}//end of class

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = RequestHandler;
}
