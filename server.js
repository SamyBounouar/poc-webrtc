var http = require('http');
var fs = require('fs');
var url = require('url');
var port = 8088;

var server = http.createServer(function(req, res) {
    var page = url.parse(req.url).pathname;
    if (page == '/') {
        fs.readFile('./index.html', 'utf-8', function(error, content) {
           res.writeHead(200, {"Content-Type": "text/html"});
           res.end(content);

            if(error) {
              response.writeHead(500, {"Content-Type": "text/plain"});
              response.write(error + "\n");
              response.end();
              return;
            }
        });
    } else if (page.indexOf('.js') != -1) {
        fs.readFile('.' + page, 'utf-8', function(error, content) {
           res.writeHead(200, {"Content-Type": "text/javascript"});
           res.end(content);
       });
    } else if (page.indexOf('.css') != -1) {
        fs.readFile('.' + page, 'utf-8', function(error, content) {
           res.writeHead(200, {"Content-Type": "text/css"});
           res.end(content);
       });
    }
}).listen(port);
console.log("Serveur tourne sur http://localhost:"+port);
