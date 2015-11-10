'use strict';

var http = require('http');
var EventEmitter = require('events');
var xtend = require('xtend');
var es = require('event-stream');

/**
 * mkdb(name, [userOpts], next)
 *
 * `mkdb` makes creating couchdb databases and their security roles easy.
 *
 * Available options are:
 *   - `security` Define security-rules for the database
 *     (see [Couchdb security](http://docs.couchdb.org/en/1.6.1/api/database/security.html))
 *
 * The rest of the options are passed to [http.request()](https://nodejs.org/api/http.html#http_http_request_options_callback).
 */

module.exports = function mkdb(name, opts) {
  let security = opts.security;
  let jsonHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  let emitter = new EventEmitter();
  delete opts.security;

  process.nextTick(createDb);
  return emitter;

  /**
   * Create the database
   */
  function createDb() {
    http.request(xtend(opts, {
      method: 'PUT',
      path: '/' + name,
      headers: jsonHeaders
    }))
    .on('error', emitter.emit.bind(emitter, 'error'))
    .on('response', function(r) {
      if (r.statusCode !== 201) return emitter.emit('errorResponse', r);
      if (!security) return emitter.emit('success');
      updateSecurity();
    })
    .end();
  }

  /**
   * Update the security document of the database
   */
  function updateSecurity() {
    let r = http.request(xtend(opts, {
      method: 'PUT',
      path: '/' + name + '/_security',
      headers: jsonHeaders
    }));

    es.readArray([security])
      .pipe(es.stringify())
      .pipe(r)
      .on('error', emitter.emit.bind(emitter, 'error'))
      .on('response', function(r) {
        if (r.statusCode !== 200) return emitter.emit('errorResponse', r);
        emitter.emit('success');
      });
  }
};
