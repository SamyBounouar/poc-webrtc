navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
);


// get video/voice stream
navigator.getUserMedia({ video: true, audio: true }, gotMedia, function () {});

function gotMedia (stream) {
    var peer1 = new SimplePeer({ initiator: true, stream: stream });
    var peer2 = new SimplePeer({ stream: stream });

    peer1.on('signal', function (data) {
        peer2.signal(data);
    });

    peer2.on('signal', function (data) {
        peer1.signal(data);
    });

    peer1.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video.video');
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });

    peer2.on('stream', function (stream) {
        // got remote video stream, now let's show it in a video tag
        var video = document.querySelector('video.video2');
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });

}

var peer1 = new SimplePeer({ initiator: true });
var peer2 = new SimplePeer();

peer1.on('signal', function (data) {
  // when peer1 has signaling data, give it to peer2 somehow
  peer2.signal(data)
})

peer2.on('signal', function (data) {
  // when peer2 has signaling data, give it to peer1 somehow
  peer1.signal(data)
})

peer2.on('data', function (data) {
    var textarea = document.querySelector('.textarea');
    var item = document.createElement('p');
    item.append(data);
    textarea.appendChild(item);
})

document.getElementById("peer1form").addEventListener("submit", function(e) {
    e.preventDefault();

    peer1.send(document.querySelector('input').value);
});
