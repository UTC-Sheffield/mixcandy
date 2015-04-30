function sourceExtra(sCode) {
        var aStr = sCode.split("\n");
        aStr.pop();
        aStr.shift();
        editor.setValue(aStr.join("\n"));
    }
    foundBeat = 0;
    var microphone;
    
$(document).ready(function(){        
    // Asynchronously loaded things
    var song, analysis, lights;
    
    // Song playback state; we have to keep track of this ourselves
    var isPlaying = false;
    var isPaused = false;
    
    // Globally scoped data shared with MIDI callbacks
    var m = null;
    var output = null;

    lights = new Lights({
      serverURL: "ws://10.101.230.13:7890",
      //serverURL: "ws://192.168.1.106:7890",
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
            
    var max_level_L = 0;
	var old_level_L = 0;
	var cnvs = document.getElementById("test");
	var cnvs_cntxt = cnvs.getContext("2d");
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	
	var audioContext = new AudioContext();
	
	var bOldMax = 0;
	var bCurrentlyMax = 0;
	var foundBeat = 0;
	var local_max_L = 0;
	
	navigator.getUserMedia(
		{audio:true}, 
		function(stream){
			microphone = audioContext.createMediaStreamSource(stream);
			var javascriptNode = audioContext.createScriptProcessor(256, 1, 1);
			
			microphone.connect(javascriptNode);
			javascriptNode.connect(audioContext.destination);
			javascriptNode.onaudioprocess = function(event){

				var inpt_L = event.inputBuffer.getChannelData(0);
				var instant_L = 0.0;

				var sum_L = 0.0;
				for(var i = 0; i < inpt_L.length; ++i) {
					sum_L += inpt_L[i] * inpt_L[i];
				}
				instant_L = Math.sqrt(sum_L / inpt_L.length);
				max_level_L = Math.max(max_level_L, instant_L);				
				local_max_L = Math.max(local_max_L, instant_L);
				
				bOldMax = bCurrentlyMax;
				
				bCurrentlyMax = (local_max_L === instant_L);
				
				instant_L = Math.max( instant_L, old_level_L -0.008 );
				
				if(bOldMax && !bCurrentlyMax) { // Falling
				    //console.log("Falling");
                    foundBeat ++;
                    //console.log("foundBeat =", foundBeat);
                    lights[lights.beatGenerator](foundBeat);				    
				}
				
				if(old_level_L > instant_L)
				{
				    local_max_L = local_max_L * 0.99;
				}
				
				old_level_L = instant_L;
				
				cnvs_cntxt.clearRect(0, 0, cnvs.width, cnvs.height);
				cnvs_cntxt.fillStyle = '#00ff00';
				cnvs_cntxt.fillRect(10,10,(cnvs.width-20)*(instant_L/max_level_L),(cnvs.height-20)); // x,y,w,h
				
    
			};
		},
		function(e){ console.log(e); }
	);
});
