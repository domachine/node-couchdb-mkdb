var _ = require('highland');
var request = require('request');

/**
 * mkdb(name, [userOpts], next)
 * 
 * `mkdb` makes creating couchdb databases and their security roles easy.
 * 
 * Available options are:
 *   - `couchdb` Set the url to the couchdb to use.
 *   - `security` Define security-rules for the database 
 *     (see [Couchdb security](http://docs.couchdb.org/en/1.6.1/api/database/security.html))
 */

module.exports = function mkdb(name, userOpts, next) {

  // Parse user options
  if (typeof userOpts === 'function') {
    next = userOpts;
    userOpts = null;
  }
  userOpts = userOpts || {
    couchdb: 'http://localhost:5984'
  };
  let couchdb = userOpts.couchdb;
  let security = userOpts.security;
  delete userOpts.security;
  delete userOpts.couchdb;

  // Create the database
  let opts = {
    url: couchdb + '/' + name,
    json: true
  };
  _('response', request.put(_.extend(userOpts, opts)))
    .flatMap(res => {
      if (res.statusCode != 201) {
        throw res;
      } else if (security) {
        let opts = {
          url: couchdb + '/' + name + '/_security',
          json: security
        };

        // Set the security rules for the database
        return _('response', request.put(_.extend(userOpts, opts)))
          .map(res => {
            if (res.statusCode != 200) {
              throw res;
            } else {
              return _([res.toJSON()]);
            }
          });
      } else {
        return _([res.toJSON()])
      }
    })

    // Fake created response
    .map(() => ({
      statusCode: 201,
      headers: {
        'content-type': 'application/json',
        'content-length': JSON.stringify({name}).length
      },
      pipe: dest => dest.end(JSON.stringify({name}))
    }))
    .errors((err, push) =>
      err.statusCode != null
        ? push(null, err)
        : push(err)
    )
    .errors(next)
    .each(next.bind(this, null));
}

