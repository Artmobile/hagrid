var numOfRequests = process.argv[2] || 10;

var request = require('request');
console.log('Starting request..');
for (var i = 0; i < numOfRequests; i++)
{
  request('http://localhost:3000/worksql/c2VsZWN0IGNvdW50KCopIGZyb20gdXNlcg0K/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log('Index - ' + i + ', ' + body) // Print the google web page.
  }
}) 
}


console.log('Rquest completed');