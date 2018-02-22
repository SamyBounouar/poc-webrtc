let app = require('express')();
let url = require('url');
let server = require('http').Server(app);
let io = require('socket.io')(server);
let port = 8080;

server.listen(port);

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
