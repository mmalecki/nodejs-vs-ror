var http = require('http'),
    url = require('url'),
    async = require('async'),
    request = require('request');

http.createServer(function (req, res) {
  var parsed = url.parse(req.url, true);
  if (parsed.pathname == '/api') {
    async.parallel({
      ror: function (callback) {
        request(
          'http://github.com/api/v2/json/repos/show/rails/rails',
          function (error, response, body) {
            callback(null, JSON.parse(body).repository.watchers);
          }
        );
      },
      nodejs: function (callback) {
        request(
          'http://github.com/api/v2/json/repos/show/joyent/node',
          function (error, response, body) {
            callback(null, JSON.parse(body).repository.watchers);
          }
        );
      }
    }, function (err, watchers) {
      var response = JSON.stringify(watchers);
      res.writeHead(200, {'Content-Type': 'application/json'});
      if (parsed.query.jsonp) {
        return res.end(parsed.query.jsonp + '(' + response + ');');
      }
      res.end(response);
    });
  }
}).listen(8000);

console.log('http server running on port 8000');

