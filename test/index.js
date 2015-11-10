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
  mkdb('db1', {port: '5984'})
    .on('success', () => {
      t.end();
    });
});

test('error-response test', t => {
  mkdb('dbfail', {port: '5984'})
    .on('errorResponse', () => {
      t.end();
    });
});

test('security fail test', t => {
  mkdb('dbsecurity', {port: '5984', security: {}})
    .on('errorResponse', () => {
      t.end();
    });
});

test('security success test', t => {
  mkdb('dbsecuritysuccess', {port: '5984', security: {}})
    .on('success', () => {
      t.end();
    });
});

test('teardown', t => {
  t.end();
});
