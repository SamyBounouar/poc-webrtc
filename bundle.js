navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
);

var context = {};

// get video/voice stream
navigator.getUserMedia({ video: true, audio: true }, gotMedia, function () {});

function gotMedia (stream) {
    context.peer1 = new SimplePeer({ initiator: true, stream: stream });
    context.peer2 = new SimplePeer({ stream: stream });

    context.peer1.on('signal', function (data) {
        console.log(data);
        context.peer2.signal(data);
    });

    context.peer2.on('signal', function (data) {
        context.peer1.signal(data);
    });

    context.peer1.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video.video');
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });

    context.peer2.on('stream', function (stream) {
        // got remote video stream, now let's show it in a video tag
        var video = document.querySelector('video.video2');
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });

    init();
}


function init() {
    context.peer2.on('data', function (data) {
        var textarea = document.querySelector('.textarea');
        var item = document.createElement('p');
        item.append(data);
        textarea.appendChild(item);
    })

    document.getElementById("peer1form").addEventListener("submit", function(e) {
        e.preventDefault();

        context.peer1.send(document.querySelector('input').value);
    });
}
