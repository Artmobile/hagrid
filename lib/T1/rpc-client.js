var amqp = require('amqp'),
	config = require('../../config');
var connection = amqp.createConnection({host:config.T2_ADDRESS});
var rpc = new (require('./amqprpc'))(connection);

//wait for a proper connection
connection.on("ready", function(){
  console.log("ready");
  //do the actual request. As the library is now it does json/object only
  rpc.makeRequest('SQL', {foo:'bar'}, function response(err, response){
    if(err)
      console.error(err);
    else
      console.log("response", response);
    connection.end();
  });
});