var assert = require("assert"),
    amqp = require('amqp'),
    async = require('async'),
    config = require('../config');

describe('RPC', function(){
  	describe('RPC-CLIENT', function(){

    	it('basic discovery', function(done){
        var connection = amqp.createConnection({host:config.T2_ADDRESS});
        var rpc = new (require('../lib/T1/rpc-client'))(connection);

        var _done = done;

        //wait for a proper connection
        connection.on("ready", function(){
          console.log("Established connection with the RMQ");

          async.forEach([1,2,3,4,5,6,7,8,9,0], function(item, next){
            var _next = next;
            rpc.makeRequest('SQL', 'Who flung poo', function response(err, response){
              if(err){
                console.log(err.toString());
                _next();
              }
              else{
                console.log(JSON.stringify(response.response));
                _next();
              }
            });

          }, function(){
            done();
          })


        });
    	})
  	})
})
