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

let socket = io.connect('http://192.168.1.137:8080');

$(function () {
  
  startPeer(true);
})


$(document).on('CONNECT_CHAT', function (e, data) {
 
})

$(document).on('DISPLAY_CHAT_ROOM', function (e, data) {

  data.forEach(function (sdp) {
    startPeer(false);
  })
})

 socket.on('SUBSCRIBE_SDP', function (listSDP) {
    console.log('SUBSCRIBE_SDP', listSDP);

    listSDP.forEach(function (sdp) {
      startPeer(false);
    })
  });

  socket.on('NEW_CLIENT', function (sdp) {
      console.log('NEW CLIENT', sdp);
      startPeer(false);
  });

let p;

function bindEvents(p) {
  p.on('error', function(err) {
      console.log('error', err);
  });

  p.on('signal', function(data) {
    //$(document).trigger('CONNECT_CHAT', data);
    console.log('SEND_SDP', data.sdp);
     socket.emit('SEND_SDP', data.sdp);
  });

  p.on('stream', function(stream) {
    console.log('on stream');

      /*let video = document.querySelector('#receiver-video');
      video.volume = 0;
      video.src = window.URL.createObjectURL(stream);
      video.play();*/
  });

  //document.querySelector('#incoming').addEventListener('submit', function(e) {
    //e.preventDefault();
    //var offerJSON = JSON.parse(e.target.querySelector('textarea').value);
    //p.signal(offerJSON);
  //});
}

var id = 1;
function createVideo() {
  $('#tchat-room').append('<div class="col-sm-3"><video width="200px" id="video-' + id + '"></video></div>');

  return 'video-' + id++;
}

function launchStream(emitterVideo, stream) {
  emitterVideo.volume = 0;
  emitterVideo.src = window.URL.createObjectURL(stream);
  emitterVideo.play();
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

      let emitterVideo = document.querySelector('#' + createVideo());
      launchStream(emitterVideo, stream);

  }, function() {});
}
