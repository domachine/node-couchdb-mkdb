var stream = require('stream');
var EventEmitter = require('events');
var test = require('tape');
var nock = require('nock');

var mkdb = require('../index');


test('setup', t => {
  nock('http://localhost:5984')
    .put('/db1')
    .reply(201)
    .put('/dbfail')
    .reply(400)
    .put('/dbsecurity')
    .reply(201)
    .put('/dbsecurity/_security')
    .reply(400)
    .put('/dbsecuritysuccess')
    .reply(201)
    .put('/dbsecuritysuccess/_security')
    .reply(200);
  t.end();
});

test('success test', t => {
  var responseCalled = false;
  mkdb('db1', {port: '5984'})
    .on('response', function() {
      responseCalled = true;
    })
    .on('success', () => {
      t.assert(responseCalled);
      t.end();
    });
});

test('error-response test', t => {
  mkdb('dbfail', {port: '5984'})
    .on('response', () => {
      t.end();
    });
});

test('security fail test', t => {
  mkdb('dbsecurity', {port: '5984', security: {}})
    .on('response', () => {
      t.end();
    });
});

test('security success test', t => {
  var responseCalled = false;
  mkdb('dbsecuritysuccess', {port: '5984', security: {}})
    .on('response', function() {
      responseCalled = true;
    })
    .on('success', () => {
      t.assert(responseCalled);
      t.end();
    });
});

test('teardown', t => {
  t.end();
});
