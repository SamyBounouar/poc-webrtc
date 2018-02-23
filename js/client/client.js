navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.mediaDevices.getUserMedia ||
    navigator.msGetUserMedia
);

let socket = io.connect('http://192.168.43.74:8080');
let uri = location.pathname.substr(1);
let p = null;


function bindEvents(p, callback) {

    p.on('signal', function (data) {
        console.log('SEND_SDP');
        socket.emit('SEND_SDP', uri, JSON.stringify(data));
    });

    p.on('stream', function (stream) {
        console.log('STREAM');
        let receiverVideo = document.querySelector('#receiver-video');
        receiverVideo.src = window.URL.createObjectURL(stream);
        receiverVideo.play();
    });
}

socket.emit("ADD_TO_ROOM", uri);

document.querySelector('#start').addEventListener('click', function (e) {
    navigator.getUserMedia(({
        video: true,
        audio: true,
    }), function (stream) {
        p  = SimplePeer({
            initiator: true,
            stream: stream,
            trickle: false
        });
        bindEvents(p);

        let emitterVideo = document.querySelector('#emitter-video');
        emitterVideo.src = window.URL.createObjectURL(stream);
        emitterVideo.play();
    }, function () {

    });
});

socket.on('NEW_CLIENT', function (offer) {

    console.log('NEW_CLIENT');

    if (p === null) {
        p  = SimplePeer({
            initiator: false,
            trickle: false
        });
        bindEvents(p);
    }

    setTimeout(function() {
        p.signal(offer)
    }, 1000);
});