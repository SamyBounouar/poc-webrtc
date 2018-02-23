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

let socket = io.connect('http://localhost:8080');
let p;
let nbClients;

$(function () {
  socket.on('GET_LIST', function (nb) {
    let clientIsTheFirst = nb == 0 ? true : false;
    console.log('clientIsTheFirst : ' + clientIsTheFirst);

    navigator.getUserMedia({
      video: true,
      audio: true
  }, function(stream) {
      p = new SimplePeer({
        initiator: clientIsTheFirst,
        stream: stream,
        trickle: false
      });
      console.log(stream);
      console.log(p);
      
      if (clientIsTheFirst == false) {
        socket.emit('CREATE_PEER', p, null);
      }
      
      bindEvents(p);

      let emitterVideo = document.querySelector('#' + createVideo(p._id));
      launchStream(emitterVideo, stream);
  }, function() {});
});

  socket.on('SEND_NEW_SDP', function(newSDPs) {
    console.log('in SEND_NEW_SDP');
    console.log(newSDPs);
      newSDPs.forEach(function (sdp) {
          p.signal(sdp);
      });
  });

  

//  let clientIsTheFirst = listClients.length == 0 ? true : false;
//console.log('clientIsTheFirst : ' + clientIsTheFirst);
  //let p;
/*  navigator.getUserMedia({
      video: true,
      audio: true
  }, function(stream) {
      p = new SimplePeer({
        initiator: true,
        stream: stream,
        trickle: false
      });
      console.log(stream);
      console.log(p);
      
      //socket.emit('CREATE_PEER', p);
     bindEvents(p);

      let emitterVideo = document.querySelector('#' + createVideo(p._id));
      launchStream(emitterVideo, stream);
  }, function() {});*/
});


/*$(document).on('CONNECT_CHAT', function (e, data) {
  socket.emit('SEND_SDP', data.sdp);
})

/*$(document).on('DISPLAY_CHAT_ROOM', function (e, data) {
  debugger
  data.forEach(function (sdp) {
    startPeer(false);
  })
})*/

 /*socket.on('SUBSCRIBE_SDP', function (listSDP) {
    console.log('SUBSCRIBE_SDP', listSDP);

    listSDP.forEach(function (sdp) {
      startPeer(false);
    })
  });
*/
  socket.on('NEW_CLIENT', function (peerAndSDP) {
      console.log('NEW CLIENT', peerAndSDP);

      let peer = peerAndSDP['peer'];
      let offer = "{'type':'offer', 'sdp': " + peerAndSDP['sdp'] + "}";
      console.log(offer);
      /*console.log(peer);
      peer.signal(offer);*/
      let video = document.querySelector('#' + createVideo(peerAndSDP['peer']['_id']));


      launchStream(video, peer.stream);
  });



function bindEvents(p) {
  console.log('in bindEvents');
  p.on('error', function(err) {
      console.log('error', err);
  });

  p.on('signal', function(data) {
    console.log('on signal');
    //$(document).trigger('CONNECT_CHAT', data);
    socket.emit('CREATE_PEER', p, data.sdp);
    //socket.emit('SEND_SDP', p, data.sdp);
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

function createVideo(peerId) {
  $('#tchat-room').append('<div class="col-sm-3" style="border:solid"><video width="200px" id="video-' + peerId + '"></video></div>');

  return 'video-' + peerId;
}

function launchStream(emitterVideo, stream) {
  emitterVideo.volume = 0;
  emitterVideo.src = window.URL.createObjectURL(stream);
  emitterVideo.play();
}


/*function startPeer(initiator) {
  navigator.getUserMedia({
      video: true,
      audio: true
  }, function(stream) {
      p = new SimplePeer({
          initiator: initiator,
          stream: stream,
          trickle: false
      });

      bindEvents(p);

      let emitterVideo = document.querySelector('#' + createVideo());
      launchStream(emitterVideo, stream);

  }, function() {});
}*/