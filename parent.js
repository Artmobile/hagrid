// T1/server is responsible for getting HTTP requests from clients, 
// sending those requests to T3 via RQ and returning chunked responses to the caller

var express = require('express'),
    app = express(),
    path = require('path');


var hostName = 'localhost';

function make_path(workerpath){
    var root = path.resolve('/' + path.relative('/')) + '/';
    return path.normalize(root + workerpath);
  }

var cp = require('child_process');
console.log(make_path('/child.js'));

var child = cp.fork(make_path('/child.js'));


child.on('message', function(m) {
  console.log('PARENT got message:', m);

});

console.log("Starting Parent Server...");


app.get('/ping/', function(req, res){
    child.send('preved');
    res.send('preved');
}); 

app.get('/64/:args', function(req, res){
    res.send(new Buffer(JSON.stringify(req.params.args), 'utf-8').toString('base64'));
});



// Start the http server
var port = 3000;

app.listen(port, function(res,req){
	console.log('Started express server...');
});
