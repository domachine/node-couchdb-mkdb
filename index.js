'use strict';

var EventEmitter = require('events');
var request = require('request');
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
  let emitter = new EventEmitter();
  delete opts.security;

  process.nextTick(createDb);
  return emitter;

  /**
   * Create the database
   */
  function createDb() {
    request.put('/' + name, xtend(opts, {json: true}))
      .on('error', emitter.emit.bind(emitter, 'error'))
      .on('response', function(r) {
        if (r.statusCode !== 201) {
          emitter.emit('errorResponse', r);
          return emitter.emit('response', r);
        }
        if (!security) {
          emitter.emit('response', r);
          return emitter.emit('success');
        }

        // Pull out unused data to avoid memory wasting.  See
        // https://nodejs.org/api/http.html#http_class_http_clientrequest.
        r.resume();
        updateSecurity();
      })
      .end();
  }

  /**
   * Update the security document of the database
   */
  function updateSecurity() {
    request.put('/' + name + '/_security', xtend(opts, {json: security}))
      .on('error', emitter.emit.bind(emitter, 'error'))
      .on('response', function(r) {
        emitter.emit('response', r);
        if (r.statusCode !== 200) return emitter.emit('errorResponse', r);
        emitter.emit('success');
      });
  }
};
