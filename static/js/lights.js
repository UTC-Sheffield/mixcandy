  var b_canvas = document.getElementById("sim");
  //console.log("b_canvas =", b_canvas);
  var b_context = b_canvas.getContext("2d");
  //console.log("b_context =", b_context);
  

function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(n) {
 n = parseInt(n,10);
 if (isNaN(n)) return "00";
 n = Math.max(0,Math.min(n,255));
 return "0123456789ABCDEF".charAt((n-n%16)/16)
      + "0123456789ABCDEF".charAt(n%16);
}

var Lights = function (o) {
    var self = this;
    
    o = o || {};

    // Required parameters
    self.layoutURL = o.layoutURL;

    // Analysis needs to be specified before this object is usable
    self.setSong(null);
    self.setAnalysis(null);

    // Optional lag adjustment, in seconds
    self.lagAdjustment = o.lagAdjustment || 0;

    // Optional Fadecandy connection parameters
    self.serverURL = o.serverURL || "ws://localhost:7890";
    self.retryInterval = o.retryInterval || 1000;
    self.frameInterval = o.frameInterval || 10;

    self.lightPattern = o.lightPattern || "rgb_horizontal";
    self.beatGenerator = o.beatGenerator || "beatgen_256";
    
    self.useSimulator = o.useSimulator || true;
    self.useMic = o.useMic || false;
    self.BPM = o.BPM || 120;
    
    
    sourceExtra( self[self.lightPattern].toSource() );
    editing = "pattern";
    $(".beatgen").hide();
    $(".pattern").show();
    
    // Callbacks
    self.onconnecting = o.onconnecting || function() {};
    self.onconnected = o.onconnected || function() {};
    self.onerror = o.onerror || function() {};
    self.onclose = o.onclose || function() {};

    // Download layout file before connecting
    $.getJSON(this.layoutURL, function(data) {
        self.layout = data;
        self.layout_stats = self.layout.reduce(function(previousValue, currentValue){
          return {
            "min":[
              Math.min(previousValue.min[0], currentValue.point[0]),
              Math.min(previousValue.min[1], currentValue.point[1]),
              Math.min(previousValue.min[2], currentValue.point[2])
            ],
            "max":[
              Math.max(previousValue.max[0], currentValue.point[0]),
              Math.max(previousValue.max[1], currentValue.point[1]),
              Math.max(previousValue.max[2], currentValue.point[2])
            ],
            "sum":[
              previousValue.sum[0]+ currentValue.point[0],
              previousValue.sum[1]+ currentValue.point[1],
              previousValue.sum[2]+ currentValue.point[2]
            ]
          };
        }, {"min":[0,0,0], "max":[0,0,0], "sum":[0,0,0]});
        
        self.layout_stats.centroid = [
          self.layout_stats.sum[0] / self.layout.length,
          self.layout_stats.sum[1] / self.layout.length,
          self.layout_stats.sum[2] / self.layout.length
        ];
        
        
          console.log("self.layout_stats =", self.layout_stats);
        self.connect();
    });
};

Lights.prototype.distanceFromCentreX = function(pos) {
 return  Math.floor(Math.abs(pos - this.layout_stats.centroid[0]));
}

Lights.prototype.distanceFromCentreY = function(pos) {
 return  Math.floor(Math.abs(pos - this.layout_stats.centroid[1]));
}

Lights.prototype.distanceFromCentreZ = function(pos) {
 return  Math.floor(Math.abs(pos - this.layout_stats.centroid[2]));
}


Lights.prototype.distanceFromCentre = function(aPoint) { //Only doing X and Y should do Z as well
  return Math.floor(Math.sqrt(Math.pow(aPoint[0] - this.layout_stats.centroid[0], 2) +
Math.pow(aPoint[1] - this.layout_stats.centroid[1], 2)));
 
}


Lights.prototype.getBeatGen = function() {
    var aFuncs = [];
    var rMatcher = /beatgen_/;
    for (var funcname in this) {
        //console.log("funcname =", funcname);
        if(rMatcher.test(funcname)) {
            aFuncs.push(funcname.replace(rMatcher, ""));
        }
    }
    return aFuncs;
};


Lights.prototype.getRgbGen = function() {
    var aFuncs = [];
    var rMatcher = /rgb_/;
    for (var funcname in this) {
        //console.log("funcname =", funcname);
        if(rMatcher.test(funcname)) {
            aFuncs.push(funcname.replace(rMatcher, ""));
        }
    }
    return aFuncs;
};

Lights.prototype.setAnalysis = function(analysis) {
    this.analysis = analysis;

    if (analysis) {
        this.BPM = this.analysis.features.BPM;
    }
    this.particleLifespan = 2 * (60.0 / this.BPM);

    this.resetSong();
};

Lights.prototype.setSong = function(song) {
    this.song = song;
    this.resetSong();
};

Lights.prototype.resetSong = function() {
    this.mood = null;
    this.segment = null;
    this._songPosition = 0;
    this.particles = [];
};

Lights.prototype.connect = function() {
    var self = this;
    self.ws = new WebSocket(this.serverURL);

    self.ws.onerror = function(event) {
        self.status = "error";
        self.onerror(event);
    };

    self.ws.onclose = function(event) {
        self.status = "closed";
        self.onclose(event);

        // Retry
        if (self.retryInterval) {
            window.setTimeout(function() {
                self.connect();
            }, self.retryInterval);
        }
    };

    self.ws.onopen = function(event) {
        self.status = "connected";
        self.onconnected();
        self._animationLoop();
    };

    self.status = "connecting";
    
    if(self.useSimulator)
    {
        self._animationLoop();
    }
    self.onconnecting();
};

Lights.prototype._animationLoop = function() {
    var self = this;
    self.doFrame();
    window.setTimeout(function() {
        self._animationLoop();
    }, self.frameInterval);
};

Lights.prototype.doFrame = function() {
    // Main animation function, runs once per frame
    
    this.frameTimestamp = new Date().getTime() * 1e-3;

    if (this.analysis && this.song) {
        this.followAnalysis();
    }

    this.renderLights();
};

Lights.prototype.followAnalysis = function() {
    var pos = this.song.pos() + this.lagAdjustment;
    var lastPos = this._songPosition;
    var beats = this.analysis.features.BEATS;
    var moods = this.analysis.features.MOODS;
    var segments = this.analysis.features.SEGMENT;

    // Find the last beat that happened between the previous frame and this one.
    var foundBeat = null;
    for (var index = 0; index < beats.length; index++) {
        if (beats[index] > lastPos && beats[index] < pos) {
            foundBeat = index;
        }
    }
    
    if (foundBeat != null) {
        this[this.beatGenerator](foundBeat);
    }

    // Match a mood for the current position
    for (var index = 0; index < moods.length; index++) {
        if (moods[index].START <= pos && moods[index].END > pos) {
            this.mood = moods[index].TYPE;
        }
    }

    // Match a segment to the current position
    for (var index = 0; index < segments.length; index++) {
        if (segments[index].START <= pos && segments[index].END > pos) {
            this.segment = segments[index];
        }
    }

    this._songPosition = pos;
};


Lights.prototype.aBeats = [];


Lights.prototype.renderLights = function() {    
    var layout = this.layout;
    var socket = this.ws;
    //var particles = this.particles;
    if(this.status === "connected") {
        var packet = new Uint8ClampedArray(4 + this.layout.length * 3);
    
        if (socket.readyState != 1 /* OPEN */) {
            // The server connection isn't open. Nothing to do.
            return;
        }
    
        if (socket.bufferedAmount > packet.length) {
            return;
        }
    }
    
    // Dest position in our packet. Start right after the header.
    var dest = 4;
    if(this.aBeats.length > 0)
    {
        // TODO : fade things out even if no analysis
        if (this.analysis || this.useMic) {
            this.aBeats = this.aBeats.map(function(aBeat){
                var iTime = this.frameTimestamp - aBeat[3];
                var fDur = Math.min( iTime / this.iBeatLength, 10);
                aBeat[4] = fDur;
                return aBeat;
            }.bind(this));
        }
        
        for (var led = 0; led < layout.length; led++) {
            var p = layout[led].point;
            
            var aRGB = [0,0,0];
            
            try{
              aRGB = this[this.lightPattern](p);
            } catch (err) {
              AddError(err);
              //console.log("err.name =", err.name, "err.lineNumber =", err.lineNumber, "err.message =", err.message);
            }
            
            if (this.status === "connected") {
                packet[dest++] = aRGB[0];
                packet[dest++] = aRGB[1];
                packet[dest++] = aRGB[2];
            } 
            
            if (this.useSimulator) {
                b_context.fillStyle = ("rgb("+aRGB[0]+","+aRGB[1]+","+aRGB[2]+")");
                b_context.fillRect(p[0] * 24, p[1] * 12, 20, 10);
            }
            
        }
        
        if(this.status === "connected") {
            socket.send(packet.buffer);
        }
    }
};
