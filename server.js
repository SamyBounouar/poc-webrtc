let app = require('express')();
let url = require('url');
let server = require('http').Server(app);
let io = require('socket.io')(server);
let fs = require('fs');
let port = 8080;

server.listen(port);

app.get('/', function (req, res) {
    fs.readFile(__dirname + '/index.html', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
});

app.get('/:channel', function (req, res) {
    fs.readFile(__dirname + '/channel.html', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading channel.html');
        }

        res.writeHead(200);
        res.end(data);
    });
});

app.get('/js/*', function (req, res) {
    let page = url.parse(req.url).pathname;
    console.log('SOURCE URL', page);
    res.sendFile(__dirname + page);
});

class Client {
    constructor(socket) {
        this.socket = socket;
        this.sdp = null;
    }

    addSDP(sdp) {
        this.sdp = sdp;

        return this;
    }

    getSocket() {
        return this.socket;
    }

    getSDP() {
        return this.sdp;
    }

    hasSDP() {
        return (this.sdp !== null);
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

        this.clients.forEach(function (client) {
            if (client.hasSDP()) {
                listSDP.push(client.getSDP());
            }
        });

        return listSDP;
    }

    listClients() {
        return this.clients;
    }

    deleteBySocket(socket) {
        let result = false;
        let self = this;

        this.clients.forEach(function (client, index) {
            if (client.getSocket().id === socket.id) {
                self.listClients().splice(index, 1);
                result = true;
            }
        });

        return result;
    }

    findBySocket(socket) {
        let result = null;

        this.clients.forEach(function (client) {
            if (client.getSocket().id === socket.id) {
                result = client;
            }
        });

        return result;
    }
}

class Room {
    constructor(name) {
        this.name = name;
        this.clients = new ClientsCollection();
    }

    getName() {
        return this.name;
    }

    getClientsCollection() {
        return this.clients;
    }
}

class RoomsCollection {
    constructor() {
        this.rooms = [];
    }

    getRooms() {
        return this.rooms;
    }

    add(room) {
        if (this.isExist(room)) {
            return this.findByName(room.name);
        }

        this.rooms.push(room);

        return this;
    }

    findByName(name) {
        let result = null;

        this.rooms.forEach(function (room) {
            if (room.name === name) {
                result = room;
            }
        });

        return result;
    }

    isExist(room) {
        return (this.findByName(room.name) !== null);
    }

    findClientBySocket(socket) {
        let user = null;

        this.rooms.forEach(function (room) {
            user = room.findClientBySocket(socket);
        });

        return user;
    }

    deleteClientBySocket(socket) {
        let user = false;

        this.rooms.forEach(function (room) {
            if (room.getClientsCollection().findBySocket(socket) !== null) {
                user = room.getClientsCollection().deleteBySocket(socket);
                user = true;
            }
        });

        return user;
    }
}

let roomsCollection = new RoomsCollection();

io.on('connection', function (socket) {
    socket.on('ADD_TO_ROOM', function (roomName) {
        let room = roomsCollection.findByName(roomName);

        if (room === null) {
            room = new Room(roomName);
            roomsCollection.add(room);
        }

        socket.join(room.getName());

        let newClient = new Client(socket);

        room.getClientsCollection().addClient(newClient);
    });

    socket.on('SEND_SDP', function (roomName, sdp) {
        let room = roomsCollection.findByName(roomName);

        let currentClient = room.getClientsCollection().findBySocket(socket);
        currentClient.addSDP(sdp);

        room.getClientsCollection().listClients().forEach(function(client) {
            if (currentClient.socket.id !== client.socket.id) {
                client.getSocket().emit('NEW_CLIENT', currentClient.getSDP());
            }
        });

        //socket.emit('SUBSCRIBE_SDP', room.getClientsCollection().listClientsSDP());
    });

    socket.on('disconnect', function () {
        roomsCollection.deleteClientBySocket(socket);
    });
});
