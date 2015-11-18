# couchdb-mkdb

[![Build Status](https://travis-ci.org/domachine/node-couchdb-mkdb.svg?branch=master)](https://travis-ci.org/domachine/node-couchdb-mkdb)

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
    security: {
      admins: {names: [req.user.name], roles: []},
      members: {names: [], roles: []}
    },

    // ... all other options are passed to the underlaying `request` function.
    // See https://github.com/request/request#requestoptions-callback
    baseUrl: app.get('couchdb'),
    auth: app.get('auth')
  };

  // Use the mkdb utility to create the database
  mkdb(name, opts)
    .on('error', next)
    .on('response', function(response) {

      // For error handling check the statusCode
      if ((response.statusCode / 100 | 0) !== 2) {
        console.log('Database wasn\'t created or security couldn\'t be updated');
      }
      response.pipe(
        res.set(response.headers)
          .status(response.statusCode)
      );
    })
    .on('success', function() {

      // Event 'response' has already been emitted
      console.log('Database successfully created');
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
[request()](https://github.com/request/request#requestoptions-callback)
function.

#### Events

  * `error(err)` - Emitted on request error
  * `errorResponse(res)` - *deprecated* Emitted when couchdb returns a paranormal response. See [Update notes](#update-notes)
  * `response(res)` - Emitted when couchdb responds to the last action
  * `success` - Emitted on success

## Tests

    $ git clone https://github.com/domachine/node-couchdb-mkdb.git
    $ cd node-couchdb-mkdb
    $ npm i
    $ npm test

## Update notes

### v2.0

`mkdb` now uses [request](https://github.com/request/request) as transport
engine.  Therefore the options you can pass are similar to
[request](https://github.com/request/request)'s options.  See
[docs](https://github.com/request/request#requestoptions-callback).

### v1.1

The first version had an 'errorResponse' event.  This has now been deprecated.
Use the 'response' event instead and check the statusCode.
