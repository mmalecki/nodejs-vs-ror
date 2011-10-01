var http = require('http'),
    url = require('url'),
    async = require('async'),
    static = require('node-static'),
    request = require('request');

var fileServer = new (static.Server)('./public');

function getRepoFollowers(repo, callback) {
  request(
    'http://github.com/api/v2/json/repos/show/' + repo,
    function (error, response, body) {
      callback(null, JSON.parse(body).repository.watchers);
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

