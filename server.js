var http = require('http');
var url = require('url');
var fs = require('fs');

var server = http.createServer(function(req, res) {
    var page = url.parse(req.url).pathname;

if (page == '/') {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
       res.writeHead(200, {"Content-Type": "text/html"});
       res.end(content);
   	});
	} else if (page.indexOf('.js') != -1) {
		fs.readFile('.' + page, 'utf-8', function(error, content) {
	       res.writeHead(200, {"Content-Type": "text/javascript"});
	       res.end(content);
	   });
	}
	else if (page.indexOf('.css') != -1) {
		fs.readFile('.' + page, 'utf-8', function(error, content) {
	       res.writeHead(200, {"Content-Type": "text/css"});
	       res.end(content);
	   });
	}
    console.log(page);
});
server.listen(8080);