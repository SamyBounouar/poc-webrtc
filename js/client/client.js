let socket = io.connect('http://192.168.43.74:8080');
let uri = location.pathname.substr(1);

let clientSDP = Math.random()*100;
socket.emit('SEND_SDP', uri, clientSDP);

socket.on('SUBSCRIBE_SDP', function (listSDP) {
    console.log('SUBSCRIBE_SDP', listSDP);
});

socket.on('NEW_CLIENT', function (sdp) {
    console.log('NEW CLIENT', sdp);
});