var path = require('path'),
	cp = require('child_process');

function make_path(procpath){
    var root = path.resolve('/' + path.relative('/')) + '/';
    //console.log('root = ' + root);
    return path.normalize(root + '/lib/T4/' + procpath);
 }

var Houston = function(callback){
		var satellite;
		//var isLaunchPermitted = 1
		var _callback = callback;
				
	function launch(){
		/*if(isLaunchPermitted == 0){
			console.log('Houston - launching satelite is not authorized');
			return;
		}*/
		console.log('Houston - launching satelite');
		satellite = cp.fork(make_path('./satellite.js'));
		console.log('Houston - satellite pid: ' + satellite.pid.toString() + ' was succesfully launched');

		satellite.on('message', function(res) {
			//console.log("Houston on message, res.err - " +  res.err.message);
			_callback(res);
 		});

		satellite.on("exit", function() {
			console.log('Houston, on exit - satellite was crashed');
			launch();
		});
		// detect and report if this child was killed
		satellite.on("SIGTERM", function() {
			console.log("Houston, on SIGTERM - satellite SIGTERM detected");
			child.exit();
			//verify if we get here on exit
		});
		/*process.on('SIGTERM',function(){
			isLaunchPermitted = 0;
            sattelite.kill('SIGTERM');
    	});*/
 	}; //end of launch
	return {
		launch: function(){
			launch();
		},
		sendCommand: function(data, responseQueue, correlationId){
			satellite.send({
				data: data,
				responseQueue: responseQueue,
				correlationId: correlationId
			}); //end of send
		}// end of function
	}; //end of return
}// end of class

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = Houston;
}
