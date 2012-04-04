var http = require('http'),
    url = require('url'),
    async = require('async'),
    static = require('node-static'),
    request = require('request');

var fileServer = new (static.Server)(
  './public',
  {
    cache: 24 * 60 * 60 * 7,
    headers: { 'Vary': 'Accept-Encoding' }
  }
);

var cacheInterval = 60 * 1000,
    cache = { valid: true };

setInterval(function () { cache.valid = false; }, cacheInterval);

function getRepoFollowers(repo, callback) {
  if (cache.valid && cache[repo] !== undefined) {
    return callback(null, cache[repo]);
  }
  request({
    url: 'http://github.com/api/v2/json/repos/show/' + repo,
    json: true
  }, function (error, response, body) {
      if (error) {
        //
        // When error occured always return value from a cache and silently
        // ignore an error
        //
        console.error(error);
        return (cache[repo] !== undefined) ?
          callback(null, cache[repo]) : callback(error, null);
      }
      cache[repo] = body.repository.watchers;
      callback(null, body.repository.watchers);
    }
  );
}

http.createServer(function (req, res) {
  var parsed = url.parse(req.url, true);
  if (parsed.pathname == '/api') {
    async.parallel({
      ror: getRepoFollowers.bind({}, 'rails/rails'),
      nodejs: getRepoFollowers.bind({}, 'joyent/node')
    }, function (err, watchers) {
      var response = JSON.stringify(watchers);
      res.writeHead(200, {'Content-Type': 'application/json'});
      if (parsed.query.jsonp) {
        return res.end(parsed.query.jsonp + '(' + response + ');');
      }
      res.end(response);
    });
  }
  else {
    req.on('end', function () {
      fileServer.serve(req, res);
    });
  }
}).listen(8000);

console.log('http server running on port 8000');

