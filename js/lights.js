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

    // Callbacks
    self.onconnecting = o.onconnecting || function() {};
    self.onconnected = o.onconnected || function() {};
    self.onerror = o.onerror || function() {};
    self.onclose = o.onclose || function() {};

    // Download layout file before connecting
    $.getJSON(this.layoutURL, function(data) {
        self.layout = data;
        self.connect();
    });
};

Lights.prototype.moodTable = {
    Peaceful:      { valence: 0/4, energy: 0/4 },
    Easygoing:     { valence: 0/4, energy: 1/4 },
    Upbeat:        { valence: 0/4, energy: 2/4 },
    Lively:        { valence: 0/4, energy: 3/4 },
    Excited:       { valence: 0/4, energy: 4/4 },
    Fun:           { valence: 0/4, energy: 4/4 },
    Tender:        { valence: 1/4, energy: 0/4 },
    Romantic:      { valence: 1/4, energy: 1/4 },
    Empowering:    { valence: 1/4, energy: 2/4 },
    Stirring:      { valence: 1/4, energy: 3/4 },
    Rowdy:         { valence: 1/4, energy: 4/4 },
    Sentimental:   { valence: 2/4, energy: 0/4 },
    Sophisticated: { valence: 2/4, energy: 1/4 },
    Sensual:       { valence: 2/4, energy: 2/4 },
    Fiery:         { valence: 2/4, energy: 3/4 },
    Energizing:    { valence: 2/4, energy: 4/4 },
    Melancholy:    { valence: 3/4, energy: 0/4 },
    Blue:          { valence: 3/4, energy: 0/4 },  // Not sure if this is right
    Cool:          { valence: 3/4, energy: 1/4 },
    Yearning:      { valence: 3/4, energy: 2/4 },
    Urgent:        { valence: 3/4, energy: 3/4 },
    Defiant:       { valence: 3/4, energy: 4/4 },
    Somber:        { valence: 4/4, energy: 0/4 },
    Gritty:        { valence: 4/4, energy: 1/4 },
    Serious:       { valence: 4/4, energy: 2/4 },
    Brooding:      { valence: 4/4, energy: 3/4 },
    Aggressive:    { valence: 4/4, energy: 4/4 }
};

Lights.prototype.setAnalysis = function(analysis) {
    this.analysis = analysis;

    if (analysis) {
        this.particleLifespan = 2 * (60.0 / this.analysis.features.BPM);
    } else {
        this.particleLifespan = 1.0;
    }

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
        this.beat(foundBeat);
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

Lights.prototype.beat = function(index) {
    // Each beat adds a new color
    this.aBeats.unshift([
        Math.floor(Math.random()*256), 
        Math.floor(Math.random()*256), 
        Math.floor(Math.random()*256),
        this.frameTimestamp,
        0
    ]);
    
    this.aBeats = this.aBeats.slice(0, 10);
    this.iBeatLength = (60.0 / this.analysis.features.BPM)
};

Lights.prototype.horizontal = function(aPoint) {
    var aBeat = this.aBeats[aPoint[2]  % this.aBeats.length];
    var r = aBeat[0];
    var g = aBeat[1];
    var b = aBeat[2];
     
    return [r, g, b];

};

Lights.prototype.horizontalTime = function(aPoint) {
    var iRow = aPoint[2]  % this.aBeats.length;
    var aBeat = this.aBeats[iRow];
    var r = aBeat[0] * (10 - aBeat[4] ) / 10;
    var g = aBeat[1] * (10 - aBeat[4] ) / 10;
    var b = aBeat[2] * (10 - aBeat[4] ) / 10;
     
    return [r, g, b];
};


Lights.prototype.horizontalTimeCenter = function(aPoint) {
    var aOut = [2,1,0,0,1,2];
    var iRow = aOut[aPoint[2]]  % this.aBeats.length;
    var aBeat = this.aBeats[iRow];
    var r = aBeat[0] * (4 - aBeat[4] ) / 3;
    var g = aBeat[1] * (4 - aBeat[4] ) / 3;
    var b = aBeat[2] * (4 - aBeat[4] ) / 3;
     
    return [r, g, b];
};

Lights.prototype.renderLights = function() {    
    var layout = this.layout;
    var socket = this.ws;
    //var particles = this.particles;
    var packet = new Uint8ClampedArray(4 + this.layout.length * 3);

    if (socket.readyState != 1 /* OPEN */) {
        // The server connection isn't open. Nothing to do.
        return;
    }

    if (socket.bufferedAmount > packet.length) {
        return;
    }

    // Dest position in our packet. Start right after the header.
    var dest = 4;
    if(this.aBeats.length > 0)
    {
        if (this.analysis) {
            this.aBeats = this.aBeats.map(function(aBeat){
                var iTime = this.frameTimestamp - aBeat[3];
                var fDur = Math.min( iTime / this.iBeatLength, 10);
                aBeat[4] = fDur;
                return aBeat;
            }.bind(this));
        }
        
        for (var led = 0; led < layout.length; led++) {
            var p = layout[led].point;
            var aRGB = this.horizontal(p);
            //var aRGB = this.horizontalTimeCenter(p);
            
            packet[dest++] = aRGB[0];
            packet[dest++] = aRGB[1];
            packet[dest++] = aRGB[2];
        }
    
        socket.send(packet.buffer);
    }
};


