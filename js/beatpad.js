/**
 * beatpad.js
 *
 * (LPR) LaunchPad Programmer's Reference
 * http://d19ulaff0trnck.cloudfront.net/sites/default/files/novation/downloads/4080/launchpad-programmers-reference.pdf
 */

    function sourceExtra(sCode) {
        var aStr = sCode.split("\n");
        aStr.pop();
        aStr.shift();
        editor.setValue(aStr.join("\n"));
    }
    
    
(function () {
  var playlist = [];

  $.getJSON("songs.json", {}, function(pdata){
        playlist = pdata;    
  }.bind(this));
  
  // Playlist state
  var currentSongIndex = 0;

  // Asynchronously loaded things
  var song, analysis, lights;

  // Song playback state; we have to keep track of this ourselves
  var isPlaying = false;
  var isPaused = false;

  // Globally scoped data shared with MIDI callbacks
  var m = null;
  var output = null;

  function switchToSong(index) {
    // Stop the current song and place the cursor at the beginning of song number 'index' 

    if (song) {
      song.stop();
      isPlaying = false;
    }

    song = playlist[index].song;
    analysis = playlist[index].analysis;

    if (song) {
      lights.setAnalysis(playlist[index].analysis);
      lights.setSong(song);
      song.pos(0);
    }
  }


  function beginLoadingSong(index) {
    var item = playlist[index];

    $.getJSON(item.analysisURL, function (data) {
      item.analysis = data;
    });

    item.song = new Howl({
      urls: [item.songURL],
      autoplay: false,
      loop: false,

      onplay: function() {
        if (index === currentSongIndex) {
          isPlaying = true;
          $('#musicStatus').text(this.urls[0]);
        }
      },
      onend: function() {
        if (index === currentSongIndex) {
          isPlaying = false;
        }
      },

      onload: function() {
        item.loaded = true;

        var lastSongIndex = playlist.length - 1;
        if (index >= lastSongIndex) {
          $('#musicStatus').text("All tracks loaded");
        } else {
          beginLoadingSong(index + 1);
        }

        // If we loaded the first song, start running it
        if (index === 0) {
          switchToSong(index);
        }
      }
    });

    $('#musicStatus').text("Loading track " + (index + 1) + " of " + playlist.length + " ...");
  }

  $("#prev").click(function (evt) {
      
    var newSongIndex = Math.max(currentSongIndex - 1, 0);
    switchToSong(newSongIndex);
    if (!isPlaying) {
      song.play();
      isPlaying = true;
      isPaused = false;
    }
    //console.log("currentSongIndex =", currentSongIndex);
  });
  
  $("#next").click(function (evt) {
    var newSongIndex = Math.min(currentSongIndex + 1, playlist.length - 1);
    switchToSong(newSongIndex);
    if (!isPlaying) {
      song.play();
      isPlaying = true;
      isPaused = false;
    }
    //console.log("currentSongIndex =", currentSongIndex);
  });
  
  // Add event listener after all the content has loaded.
  window.addEventListener('load', function() {

    // Load all songs in order
    beginLoadingSong(0);

    lights = new Lights({
      serverURL: "ws://192.168.1.106:7890",
      lagAdjustment: -0.025,
      layoutURL: "data/shield.json",
      onconnecting: function() {
          $('#ledStatus').text("Connecting to Fadecandy LED server...");
      },
      onconnected: function() {
          $('#ledStatus').text("Connected to Fadecandy LED server");
          this.useSimulator = false;
      },
      onerror: function() {
          $('#ledStatus').text("Error connecting to LED server");
      },
      lightPattern: $("#pattern").val(),
      beatGenerator:$("#beatgen").val()
    });

    
    
    // Create the UI
    document.getElementById('play').onclick = function () {
      song.play();
    };
    document.getElementById('pause').onclick = function () {
      song.pause();
    };
    
    var editing = "pattern";
    
    lights.getRgbGen().forEach(function(funcname) {
        $('#pattern').append(new Option(funcname, funcname));
    });
    lights.getBeatGen().forEach(function(funcname) {
        $('#beatgen').append(new Option(funcname, funcname));
    });
    
    
    document.getElementById("pattern").onchange = function(evt){
        lights.lightPattern = "rgb_"+evt.target.value;
        sourceExtra(lights[lights.lightPattern].toSource());
        editing = "pattern";
        $(".beatgen").hide();
        $(".pattern").show();
    };
    
    
    document.getElementById("beatgen").onchange = function(evt){
        lights.beatGenerator = "beatgen_"+evt.target.value;
        sourceExtra(lights[lights.beatGenerator].toSource());
        editing = "beatgen";
        $(".beatgen").show();
        $(".pattern").hide();
    };

    document.getElementById("usecode").onclick = function(evt){
        var script = editor.getValue();
        if (editing === "pattern") {
            lights.newpattern = new Function("aPoint", script);
            lights.lightPattern = "newpattern";
        } else {
            lights.newbeatgen = new Function("index", script);
            lights.beatGenerator = "newbeatgen";
        }
    };
        
    
    
  });

})();
