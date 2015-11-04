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

    // `couchdb` and `security` are special options ...
    couchdb: app.get('couchdb'),
    security: {
      admins: {names: [req.user.name], roles: []},
      members: {names: [], roles: []}
    },

    // ... all other options are passed to the underlaying `request` function.
    // See https://github.com/request/request.
    oauth: app.get('auth')
  };

  // Use the mkdb utility to create the database
  mkdb(name, opts, (err, response) => {
    if (err) return next(err);

    // Just crap couchdb's response and push it down to the client
    response.pipe(
      res.set(response.headers)
        .status(response.statusCode)
    );
  });
});
```

## API

### mkdb(name, [opts], callback)

  - `name` The name of the database
  - `opts` Optional options object. See below
  - `callback` Function with the signature `fn(error, response)`

Available options are:

  - `couchdb` The url to the couchdb
  - `security` The security rules to apply to the database.  See [Couchdb security](http://docs.couchdb.org/en/1.6.1/api/database/security.html)

All other options are passed to the underlaying [request](https://github.com/request/request) function.
