var http = require('http'),
    async = require('async'),
    request = require('request'),
    cacheInterval = 1000 * 60;

var cache = {};
setInterval(function () { cache = {}; }, cacheInterval);

// ghetto called, they want their template back!
var template = 
  "<!DOCTYPE html>" +
  "<html>" +
  "  <head>" + 
  "    <meta charset='utf-8' />" +
  "    <title>node.js vs RoR</title>" +
  "    <link rel='stylesheet' href='http://twitter.github.com/bootstrap/1.3.0/bootstrap.min.css'>" +
  "    <style type='text/css'>" +
  "      html, body {" +
  "        height: 100%;" +  // indeed, CSS.
  "      }" +
  "      .container {" +
  "        position: relative;" +
  "        top: 40%;" +
  "      }" +
  "      h1 {" +
  "        font-size: 52px" +
  "      }" +
  "      h2 {" +
  "        font-size: 42px;" +
  "      }" +
  "      .span8 {" +
  "        text-align: center;" +
  "      }" +
  "    </style>" +
  "  </head>" +
  "  <body>" +
  "    <div class='container'>" +
  "      <div class='row'>" +
  "        <div class='span8'>" +
  "          <h1><a href='https://github.com/joyent/node'>node.js</a></h1>" +
  "          <h2>%(nodejs)</h2>" +
  "        </div>" +
  "        <div class='span8'>" +
  "          <h1><a href='https://github.com/rails/rails'>Ruby on Rails</a></h1>" +
  "          <h2>%(ror)</h2>" +
  "        </div>" +
  "      </div>" +
  "      <div class='row'>" +
  "        <div class='span4 offset12'>" +
  "          <p>by Maciej Małecki: <a href='https://twitter.com/maciejmalecki'>Twitter</a>, <a href='https://github.com/mmalecki'>GitHub</a>" +
  "        </div>" +
  "      </div>" +
  "    </div>" +
  "  </body>" +
  "</html>";

http.createServer(function (req, res) {
  var ror, nodejs;

  res.writeHead(200, {'Content-Type': 'text/html'});
  if (cache.output) {
    return res.end(cache.output);
  }

  async.parallel({
    ror: function (callback) {
      request(
        'http://github.com/api/v2/json/repos/show/rails/rails',
        function (error, response, body) {
          ror = JSON.parse(body).repository.watchers;
          callback(null, ror);
        }
      );
    },
    nodejs: function (callback) {
      request(
        'http://github.com/api/v2/json/repos/show/joyent/node',
        function (error, response, body) {
          nodejs = JSON.parse(body).repository.watchers;
          callback(null, nodejs);
        }
      );
    }
  }, function (err, watchers) {
    cache.output = template.replace('%(nodejs)', watchers.nodejs).replace('%(ror)', watchers.ror); // lol
    res.end(cache.output);
  });
}).listen(8000);

console.log('http server running on port 8000');

