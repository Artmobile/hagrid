process.on('message', function(m) {
  console.log('CHILD got message:', m);
  process.send({ foo: 'medved' });
});

process.on('message', function(m) {
  console.log('CHILD got message 2:', m);
  process.send({ foo: 'medved' });
});

process.send({ foo: 'bar' });