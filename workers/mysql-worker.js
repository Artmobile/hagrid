var MySQLExecuter = function(args){

	this.args = args;

	return {	
		exec: function(onData, onError, done){
			var mysql      = require('mysql');
			var connection = mysql.createConnection({
			  host     	: 'localhost',
			  database	: 'admin',
			  user     	: 'root',
			  password : 'sa',
			});
			
			connection.connect();
			//console.log("successfuly connected to mysql");
			connection.query(args, function(err, rows, fields) {
			  if (err) {
			  	onError(err);
			  }
			  if(rows) {
			  	onData(JSON.stringify({rows: rows}));
			  }
			  if (done) done();
			});
			connection.end();
		}
	}
}

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = MySQLExecuter;
}
