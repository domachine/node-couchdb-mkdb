# couchdb-mkdb

`couchdb-mkdb` makes it easy to create databases and stream couchdb's response.

## Installation

    $ npm i -S couchdb-mkdb

## Usage

*Express example*

This express route creates new databases on every request.
```js
...
app.post('/', (req, res, next) => {
  let name = 'mydb-' + uuid.v1();
  let opts = {

    // `security` is a special option ...
    host: app.get('couchdb'),
    security: {
      admins: {names: [req.user.name], roles: []},
      members: {names: [], roles: []}
    },

    // ... all other options are passed to the underlaying `request` function.
    // See [http.request()](https://nodejs.org/api/http.html#http_http_request_options_callback)
    auth: app.get('auth')
  };

  // Use the mkdb utility to create the database
  mkdb(name, opts)
    .on('error', next)
    .on('errorResponse', function(response) {
      response.pipe(
        res.set(response.headers)
          .status(response.statusCode)
      );
    })
    .on('success', function() {
      res.send({ok: true});
    });
});
```

## API

### mkdb(name, [opts], callback)

  - `name` The name of the database
  - `opts` Optional options object. See below
  - `callback` Function with the signature `fn(error, response)`

Available options are:

  - `security` The security rules to apply to the database.  See [Couchdb security](http://docs.couchdb.org/en/1.6.1/api/database/security.html)

All other options are passed to the underlaying
[http.request()](https://nodejs.org/api/http.html#http_http_request_options_callback)
function.

#### Events

  * `error(err)` - Emitted on request error
  * `errorResponse(res)` - Emitted when couchdb returns a paranormal response
  * `success` - Emitted on success

## Tests

    $ git clone https://github.com/domachine/node-couchdb-mkdb.git
    $ cd node-couchdb-mkdb
    $ npm i
    $ npm test
