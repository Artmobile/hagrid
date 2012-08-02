var async = require('async');

var TestWorker = function(args){

	this.args = args;

	return {	
		exec: function(onData, onError, done){
				async.forEach([1,2,3,4,5,6,7,8,9], 
					function(item, next){
						// Publish item next in line
						onData(item.toString());
					},
					function(){
						// Signal that we have finished
						done();
					});
			}
	}
}

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = TestWorker;
}
