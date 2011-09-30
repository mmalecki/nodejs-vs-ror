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
  "      .span8, .span16 {" +
  "        text-align: center;" +
  "      }" +
  "      .bottom {" +
  "        position: absolute;" +
  "        bottom: 0px;" +
  "        right: 0px;" +
  "        background-color: #98AFC7;" +
  "        padding: 8px;" +
  "        border-top-left-radius: 8px;" +
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
  "        <div class='span16'>" +
  "          <h1 style='margin-top: 128px'>%(text)</h1>" +
  "        </div>" +
  "      </div>" +
  "    </div>" +
  "    <div class='bottom'>" +
  "      <p style='margin: 0px'>" +
  "        by Maciej Małecki: <a rel='me' href='https://twitter.com/maciejmalecki'>Twitter</a>, <a rel='me' href='https://github.com/mmalecki'>GitHub</a>" +
  "        <br />" +
  "        <a href='https://github.com/mmalecki/nodejs-vs-ror'>Source</a>" +
  "      </p>" +
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
    var text = (watchers.ror > watchers.nodejs) ? "Not quite there... yet!" : "Wooooooooo!";
    cache.output = template
                   .replace('%(nodejs)', watchers.nodejs)
                   .replace('%(ror)', watchers.ror)
                   .replace('%(text)', text);
    res.end(cache.output);
  });
}).listen(8000);

console.log('http server running on port 8000');

