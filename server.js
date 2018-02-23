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
    constructor(socket, peer) {
        this.socket = socket;
        this.peer = peer;
        //this.sdp = sdp;
    }

    getSocket() {
        return this.socket;
    }

    setSDP(sdp) {
      this.sdp = sdp;
    }

    getSDP() {
        return this.sdp;
    }

    hasSDP() {
        return this.sdp !== null;
    }

    getPeer() {
        return this.peer;
    }

    getPeerAndSDP() {
        return {peer: this.peer, sdp: this.sdp};
    }
}

class ClientsCollection {
    constructor(){
        this.clients = [];
    }

    addClient(client) {
        this.clients.push(client);
    }

    getClientByPeer(peer) {
      console.log('in getClientByPeer');
      console.log(this.clients.length);

      let res = null;
      this.clients.forEach(function (client, index) {
          if (client.getPeer()['_id'] == peer['_id']) {
            res = client;
          }
      });
      return res;
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

    listClientsToString() {
      let str = "";
      this.clients.forEach(function (client, index) {
        str += client.getPeer()['_id'] + ' ---- ' + client.getSDP() + '::::::::';
      });
      return str;
    }
}

let clientsCollection = new ClientsCollection();

io.on('connection', function (socket) {
  socket.emit('GET_LIST', clientsCollection.listClients().length);

  socket.on('CREATE_PEER', function(peer, sdp) {
    console.log('on createPeer');
    let currentClient = new Client(socket, peer);
    currentClient.setSDP(sdp);
//console.log(currentClient.getPeer());
    clientsCollection.addClient(currentClient);
console.log(clientsCollection.listClients().length);
    clientsCollection.listClients().forEach(function(client) {

      let newSDPs = [];

      if (currentClient !== client) {
          console.log('here');
          newSDPs.push(client.getSDP());
          client.getSocket().emit('SEND_NEW_SDP', newSDPs);
          client.getSocket().emit('NEW_CLIENT', currentClient.getPeerAndSDP());
      }
    });
  });



  

  /*socket.on('SEND_SDP', function (peer, sdp) {
      let client = clientsCollection.getClientByPeer(peer);
      if (client != null) {
        console.log('setSDP');
        client.setSDP(sdp);
      }
  });*/
});


/*
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
*/