# [nodejs-vs-ror](http://nodejs-vs-ror.nodejitsu.com/)
Copyright (C) 2011 by Maciej Małecki
MIT License (see LICENSE file)

Compare number of [node.js](https://github.com/joyent/node) and [Ruby on Rails](https://github.com/rails/rails) watchers.

## API
Now with an API (it's more like a side effect of using [knockout.js](http://knockoutjs.com/), but if you like outsourcing your nerdfight):

### Endpoints

#### `/api`

Parameters:

  * `jsonp` - JSON callback

Output:

    {"ror":10470,"nodejs":9768}

Or, when queried like: `/api?jsonp=callback`:

    callback({"ror":10470,"nodejs":9768});

