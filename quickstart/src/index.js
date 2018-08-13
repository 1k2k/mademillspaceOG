"use strict";

var Video = require("twilio-video");

var activeRoom;
var previewTracks;
var identity;
var roomName;
var roomId;

var $remoteMedia = $("#remote-media");
var $controlIcons = $("#control-icons");
var $mircophoneOn = $("#mircophone-on", $controlIcons);
// var $mircophoneOff = $("#mircophone-off", $controlIcons);
var $videoOn = $("#video-on", $controlIcons);
var $userLogin = $("#user-login");
var $loginModal = $("#loginModal");
// var $videoOff = $("#video-off", $controlIcons);

var slackWebHook = "YOUR-SLACK-WEB-HOOK";

var urlString = window.location.href;
$controlIcons.hide();

function isTouchDevice() {
  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  var mq = function(query) {
    return window.matchMedia(query).matches;
  }
  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  }
  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}

if(!isTouchDevice()){
  $('body').addClass('no-touch');
} else {
  $('body').addClass('touch').on('touchstart', function() {});
}

function LoadingBox() {
  this.show = function() {
    if ($("#loading").is(":visible")) {
      return;
    }
    $("#loading").fadeIn(500);
  };

  this.hide = function() {
    $("#loading").fadeOut(500);
  };
}
var oLoadingDiv = new LoadingBox();

function getRandomRoom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRoomId() {
  var url = new URL(urlString);
  return url.searchParams.get("roomid");
}

roomId = getRoomId();
console.log("roomId", roomId);
// $remoteMedia.addClass("width-fix");
// return;

roomName = roomId || getRandomRoom(5, 100000);
console.log(roomName);

var fixVideoHeight = function($vdo) {
  console.log($vdo[0]);
  if ($vdo[0].videoWidth > $vdo[0].videoHeight) {
    var videoHeight = $vdo.height();
    console.log(videoHeight);
    $(".videoContainer", $remoteMedia).height(videoHeight);
  }
};

// var fixRemoteVideoWidth = function() {
//   var $remoteVideo = $('[data-tag="video"]', $remoteMedia);
//   var $video = $("video", $remoteMedia);
//   var $videoContainer = $(".videoContainer", $remoteMedia);
//   $videoContainer.css("height","");
//   if ($videoContainer.length > 1) {
//     $remoteVideo.removeClass().addClass("col-6 col-lg-4");
//   } else {
//     $remoteVideo.removeClass().addClass("col-12 col-lg-4");
//   }
//   $remoteVideo.addClass("trackTag videoTag");
//   $remoteVideo.each(function(i, v) {
//     var $this = $(this);
//     var $video = $this.find("video");
//     console.log(
//       "height",
//       $video[0].videoHeight + " ,w: " + $video[0].videoWidth
//     );
//     console.log($video[0].readyState);
//     if ($video[0].readyState === 4) {
//       fixVideoHeight($video);
//     } else {
//       $video[0].onloadedmetadata = function() {
//         fixVideoHeight($video);
//       };
//     }
//   });
// };
// fixRemoteVideoWidth();
// return;

console.log("roomId", roomId);
if (!roomId) {
  oLoadingDiv.show();
}

function showClose() {
  $(".closeIcon").css({ display: "inline-block" });
}

// Attach the Tracks to the DOM.
function attachTracks(tracks, container, participantIdentity) {
  if ($(container).is("#local-media")) {
    tracks.forEach(function(track) {
      container.appendChild(track.attach());
    });
  } else {
    tracks.forEach(function(track) {
      const trackAttach = track.attach();
      if (trackAttach.nodeName === "AUDIO") {
        $(container).append(
          '<div data-identity="' +
            participantIdentity +
            '" class="trackTag audioTag"></div>'
        );
        $('.audioTag[data-identity="' + participantIdentity + '"]').html(
          trackAttach
        );
      } else {
        $(container).append(
          '<div data-tag="video" data-identity="' +
            participantIdentity +
            '" class="col-lg-4 trackTag videoTag"><div class="videoContainer"></div></div>'
        );
        $(
          '.videoTag[data-identity="' +
            participantIdentity +
            '"] .videoContainer'
        )
          .html(trackAttach)
          .append(
            '<div data-identity="' +
              participantIdentity +
              '" class="closeIcon"></div>'
          );
      }
      // $(trackAttach).attr("data-identity", participantIdentity);
    });
    fixRemoteVideoWidth(window.room.participants.size);
  }
}

// Attach the Participant's Tracks to the DOM.
function attachParticipantTracks(participant, container) {
  var tracks = Array.from(participant.tracks.values());
  var participantIdentity = participant.identity;
  attachTracks(tracks, container, participantIdentity);
}

// Detach the Tracks from the DOM.
function detachTracks(tracks) {
  tracks.forEach(function(track) {
    track.detach().forEach(function(detachedElement) {
      $(detachedElement)
        .closest(".trackTag")
        .remove();
      detachedElement.remove();
    });
  });
  fixRemoteVideoWidth(window.room.participants.size);
}

// Detach the Participant's Tracks from the DOM.
function detachParticipantTracks(participant) {
  var tracks = Array.from(participant.tracks.values());
  detachTracks(tracks);
}

function fixRemoteVideoWidth(size) {
  setTimeout(function() {
    var $remoteVideo = $('[data-tag="video"]', $remoteMedia);
    var $videoContainer = $(".videoContainer", $remoteMedia);
    $videoContainer.css("height", "");
    var $video = $("video", $remoteVideo);
    if (size > 1) {
      $remoteVideo.removeClass().addClass("col-6 col-lg-4");
    } else {
      $remoteVideo.removeClass().addClass("col-12 col-lg-4");
    }
    $remoteVideo.addClass("trackTag videoTag");
    $remoteVideo.each(function(i, v) {
      var $this = $(this);
      var $video = $this.find("video");
      console.log("h:", $video[0].videoHeight + " ,w: " + $video[0].videoWidth);
      console.log($video[0].readyState);
      if ($video[0].readyState === 4) {
        fixVideoHeight($video);
      } else {
        $video[0].onloadedmetadata = function() {
          fixVideoHeight($video);
        };
      }
    });
    // if ($video[0].videoWidth > $video[0].videoHeight) {
    //   var videoHeight = $video.height();
    //   $(".videoContainer", $remoteMedia).height(videoHeight);
    // }
  }, 100);
}

// When we are about to transition away from this page, disconnect
// from the room, if joined.
window.addEventListener("beforeunload", leaveRoomIfJoined);

// return;

// Obtain a token from the server in order to connect to the Room.
$.getJSON("/token", function(data) {
  identity = data.identity;
  // document.getElementById("room-controls").style.display = "block";

  // Bind button to join Room.
  // document.getElementById('button-join').onclick = function() {
  // roomName = getRandomRoom(5. 1000);
  if (!roomName) {
    alert("Please enter a room name.");
    return;
  }

  log("Joining room '" + roomName + "'...");
  var connectOptions = {
    name: roomName
    // logLevel: "debug"
  };

  if (previewTracks) {
    connectOptions.tracks = previewTracks;
  }

  // Join the Room with the token from the server and the
  // LocalParticipant's Tracks.
  Video.connect(
    data.token,
    connectOptions
  ).then(roomJoined, function(error) {
    log("Could not connect to Twilio: " + error.message);
  });
  // };

  // Bind button to leave Room.
  // document.getElementById("button-leave").onclick = function() {
  //   log("Leaving room...");
  //   activeRoom.disconnect();
  // };
});

// $('.hi-icon-wrap').on("click", function(){

// });

// Successfully connected!
function roomJoined(room) {
  window.room = activeRoom = room;

  var localParticipant = room.localParticipant;
  $controlIcons.fadeIn(500);

  $remoteMedia.on("click", ".closeIcon", function() {
    const participantIdentity = $(this).attr("data-identity");
    console.log(participantIdentity);

    // room.participants.each({ status: "connected" }, participant => {
    //     alert(participant.duration);
    //   });

    // $.ajax({
    //   type: "GET",
    //   url: "/deleteParticipant",
    //   data: {
    //   participant: participantIdentity,
    //   roomid: activeRoom
    // },
    // }).done(function(data) {
    //   alert("Data Loaded: " + data.status);
    // });

    $.post(
      "/removeParticipant",
      {
        participant: participantIdentity,
        roomid: roomName
      },
      function(data) {
        log("Data Loaded: " + data.status);
      }
    );
  });

  $(".microphone-control", $controlIcons).on("click", event => {
    event.preventDefault();
    localParticipant.audioTracks.forEach(function(audioTrack) {
      if (audioTrack.isEnabled) {
        audioTrack.disable();
        // $mircophoneOff.addClass("active");
        $mircophoneOn.removeClass("active");
      } else {
        audioTrack.enable();
        $mircophoneOn.addClass("active");
        // $mircophoneOff.removeClass("active");
      }
    });
    $(this)
      .find("a")
      .blur();
  });

  $userLogin.on("click", event => {
    event.preventDefault();

    $loginModal.modal();
  });

  $("#loginSubmit", $loginModal).on("click", event => {
    event.preventDefault();

    const username = $("#auth_username", $loginModal).val();
    const password = $("#auth_password", $loginModal).val();
    console.log(username);
    if (!username || !password) {
      return;
    }
    $.post(
      "/users/login",
      {
        username: username,
        password: password
      },
      function(data) {
        log("Message: " + data.message);
        $loginModal.find(".close").trigger("click");
        if (data.status === 1) {
          showClose();
          $userLogin.hide();
          $("#auth_username", $loginModal).val("");
          $("#auth_password", $loginModal).val("");
        } else {
          alert(data.message);
        }
      }
    );
  });

  $(".video-control", $controlIcons).on("click", event => {
    event.preventDefault();
    localParticipant.videoTracks.forEach(function(videoTrack) {
      if (videoTrack.isEnabled) {
        videoTrack.disable();
        // $videoOff.addClass("active");
        $videoOn.removeClass("active");
      } else {
        videoTrack.enable();
        $videoOn.addClass("active");
        // $videoOff.removeClass("active");
      }
    });
    $(this)
      .find("a")
      .blur();
  });

  console.log("local Participant", localParticipant);

  if (!roomId) {
    var hookPath = urlString + "?roomid=" + roomName;

    $.ajax({
      data:
        "payload=" +
        JSON.stringify({
          text: "<" + hookPath + "|Click here to join the room>"
        }),
      dataType: "json",
      processData: false,
      type: "POST",
      url: slackWebHook
    });
  }
  log("Joined as '" + identity + "'");
  // document.getElementById("button-join").style.display = "none";
  // document.getElementById("button-leave").style.display = "inline";

  // Attach LocalParticipant's Tracks, if not already attached.
  var previewContainer = document.getElementById("local-media");
  if (!previewContainer.querySelector("video")) {
    attachParticipantTracks(localParticipant, previewContainer);
  }

  // Attach the Tracks of the Room's Participants.
  room.participants.forEach(function(participant) {
    log("Already in Room: '" + participant.identity + "'");
    var previewContainer = document.getElementById("remote-media");
    attachParticipantTracks(participant, previewContainer);
  });

  // When a Participant joins the Room, log the event.
  room.on("participantConnected", function(participant) {
    if (!roomId) {
      oLoadingDiv.hide();
    }
    console.log("participants-size:", room.participants.size);
    log("participants-size: '" + room.participants.size + "'");
    fixRemoteVideoWidth(room.participants.size);
    log("Joining: '" + participant.identity + "'");
  });

  // When a Participant adds a Track, attach it to the DOM.
  room.on("trackAdded", function(track, participant) {
    var participantIdentity = participant.identity;
    log(participantIdentity + " added track: " + track.kind);
    var previewContainer = document.getElementById("remote-media");
    attachTracks([track], previewContainer, participantIdentity);
  });

  // When a Participant removes a Track, detach it from the DOM.
  room.on("trackRemoved", function(track, participant) {
    log(participant.identity + " removed track: " + track.kind);
    detachTracks([track]);
  });

  // When a Participant leaves the Room, detach its Tracks.
  room.on("participantDisconnected", function(participant) {
    log("Participant '" + participant.identity + "' left the room");
    log("participants-size: '" + room.participants.size + "'");
    console.log("participants-size:", room.participants.size);
    fixRemoteVideoWidth(room.participants.size);
    detachParticipantTracks(participant);
  });

  // Once the LocalParticipant leaves the room, detach the Tracks
  // of all Participants, including that of the LocalParticipant.
  room.on("disconnected", function() {
    log("Left");
    if (previewTracks) {
      previewTracks.forEach(function(track) {
        track.stop();
      });
    }
    detachParticipantTracks(localParticipant);
    room.participants.forEach(detachParticipantTracks);
    activeRoom = null;
    // document.getElementById("button-join").style.display = "inline";
    // document.getElementById("button-leave").style.display = "none";
  });
}

// Preview LocalParticipant's Tracks.
// document.getElementById("button-preview").onclick = function() {
var localTracksPromise = previewTracks
  ? Promise.resolve(previewTracks)
  : Video.createLocalTracks();

localTracksPromise.then(
  function(tracks) {
    window.previewTracks = previewTracks = tracks;
    var previewContainer = document.getElementById("local-media");
    if (!previewContainer.querySelector("video")) {
      log("localTracksPromise");
      attachTracks(tracks, previewContainer);
    }
  },
  function(error) {
    console.error("Unable to access local media", error);
    log("Unable to access Camera and Microphone");
  }
);
// };

// Activity log.
function log(message) {
  var logDiv = document.getElementById("log");
  logDiv.innerHTML += "<p>&gt;&nbsp;" + message + "</p>";
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Leave Room.
function leaveRoomIfJoined() {
  if (activeRoom) {
    activeRoom.disconnect();
  }
}
