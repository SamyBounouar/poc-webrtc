navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

var IS_CHROME = !!window.webkitRTCPeerConnection,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription;

if (IS_CHROME) {
  RTCPeerConnection = webkitRTCPeerConnection;
  RTCIceCandidate = window.RTCIceCandidate;
  RTCSessionDescription = window.RTCSessionDescription;
} else {
  RTCPeerConnection = mozRTCPeerConnection;
  RTCIceCandidate = mozRTCIceCandidate;
  RTCSessionDescription = mozRTCSessionDescription;
}

let p;

function bindEvents(p) {
  p.on('error', function(err) {
      console.log('error', err);
  });

  p.on('signal', function(data) {
      document.querySelector('#offer').textContent = JSON.stringify(data);
  });

  p.on('stream', function(stream) {
      let video = document.querySelector('#receiver-video');
      video.volume = 0;
      video.src = window.URL.createObjectURL(stream);
      video.play();
  });

  document.querySelector('#incoming').addEventListener('submit', function(e) {
    e.preventDefault();
    var offerJSON = JSON.parse(e.target.querySelector('textarea').value);
    p.signal(offerJSON);
  });
}



function startPeer(initiator) {
  navigator.getUserMedia({
      video: true,
      audio: true
  }, function(stream) {
      var p = new SimplePeer({
          initiator: initiator,
          stream: stream,
          trickle: false
      });
      bindEvents(p);

      let emitterVideo = document.querySelector('#emitter-video');
      emitterVideo.volume = 0;
      emitterVideo.src = window.URL.createObjectURL(stream);
      emitterVideo.play();
  }, function() {});
}

// L'auteur de l'appel appelera la méthode startTalk() dès le démarrage
document.querySelector('#start').addEventListener('click', function(e) {
    startPeer(true);
});

document.querySelector('#receive').addEventListener('click', function(e) {
    startPeer(false);
});