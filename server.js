let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let http = require('http');
let fs = require('fs');
let url = require('url');
let port = 8088;

let cliServer = http.createServer(function(req, res) {
    let page = url.parse(req.url).pathname;
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

server.listen(8087);

app.get('*', function (req, res) {
    let page = url.parse(req.url).pathname;
    console.log(page);
    res.sendfile(__dirname + page);
});

class Client {
    constructor(socket, sdp) {
        this.socket = socket;
        this.sdp = sdp;
    }

    getSocket() {
        return this.socket;
    }

    getSDP() {
        return this.sdp;
    }

    hasSDP() {
        return this.sdp !== null;
    }
}

class ClientsCollection {
    constructor(){
        this.clients = [];
    }

    addClient(client) {
        this.clients.push(client);
    }

    listClientsSDP() {
        let listSDP = [];

        this.clients.forEach(function (client, index) {
            if (client.hasSDP()) {
                listSDP.push(client.getSDP());
            }
        });

        return listSDP;
    }

    listClients() {
        return this.clients;
    }
}

let clientsCollection = new ClientsCollection();

io.on('connection', function (socket) {
    socket.on('SEND_SDP', function (sdp) {
        let currentClient = new Client(socket, sdp);
        clientsCollection.addClient(currentClient);

            clientsCollection.listClients().forEach(function(client) {
            if (currentClient !== client) {
                client.getSocket().emit('NEW_CLIENT', currentClient.getSDP());
            }
        });
    });

    socket.emit('SUBSCRIBE_SDP', clientsCollection.listClientsSDP());
});
