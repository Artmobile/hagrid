var mysql      = require('mysql');
var MySQLExecuter = function(args){
	

	return {	
		exec: function(callback){
			var connection = mysql.createConnection({
			  host     	: 'localhost',
			  database	: 'admin',
			  user     	: 'root',
			  password : 'sa',
			});
			connection.connect();
			//console.log("successfuly connected to mysql");
			connection.query(args, function(err, rows, fields) {
				connection.end();	
				callback(rows, err);
			}); //end of query
		} //end of exec
	} //end return


}

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = MySQLExecuter;
}
