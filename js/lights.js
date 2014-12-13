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
    // Follow along with the music analysis in real-time. Fires off a beat() for
    // each beat, and sets "this.mood" and "this.segment" according to the current position.

    // NB: This could be much more efficient, but right now it's optimized to handle arbitrary
    // seeking in a predictable way.

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


Lights.prototype.renderLights = function() {
    // Big monolithic chunk of performance-critical code to render particles to the LED
    // model, assemble a framebuffer, and send it out over WebSockets.

    /* if (analysis) {
        this.particleLifespan = 1 * (60.0 / this.analysis.features.BPM);
    } else {
        this.particleLifespan = 1.0;
        particle.intensity = 1.0 - age;
    }*/
    //var aColor = this.colors[p[2]  % this.colors.length];
            
    
    var layout = this.layout;
    var socket = this.ws;
    //var particles = this.particles;
    var packet = new Uint8ClampedArray(4 + this.layout.length * 3);

    if (socket.readyState != 1 /* OPEN */) {
        // The server connection isn't open. Nothing to do.
        return;
    }

    if (socket.bufferedAmount > packet.length) {
        // The network is lagging, and we still haven't sent the previous frame.
        // Don't flood the network, it will just make us laggy.
        // If fcserver is running on the same computer, it should always be able
        // to keep up with the frames we send, so we shouldn't reach this point.
        return;
    }

    // Dest position in our packet. Start right after the header.
    var dest = 4;

    for (var led = 0; led < layout.length; led++) {
        var p = layout[led].point;
        //console.log("p =", p);
        //console.log("this.colors =", this.colors);
        if(this.colors.length > 0){
            //var aColor = this.colors[p[2]  % this.colors.length];
            var aColor = this.colors[Math.abs(p[2]-2)  % this.colors.length];
            //console.log("aColor =", aColor);
            
            // Fast accumulator for particle brightness
            // TODO : make time based fade
            var r = aColor[0] * (1 - (p[0]) );
            var g = aColor[1] * (1 - (p[0]) );
            var b = aColor[2] * (1 - (p[0]) );
               
            packet[dest++] = r;
            packet[dest++] = g;
            packet[dest++] = b;
        } else {
            packet[dest++] = 127;
            packet[dest++] = 127;
            packet[dest++] = 127;
        }
    }

    socket.send(packet.buffer);
};


Lights.prototype.colors = [];

Lights.prototype.beat = function(index) {
    // Each beat adds a new color
    this.colors.unshift([Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256)]);
    //console.log("this.colors =", this.colors);
    
    /*
    var totalEnergy = 0;

    for (var tag in this.mood) {
        var moodInfo = this.moodTable[tag];
        if (moodInfo) {
            var valence = moodInfo.valence * this.mood[tag] * 0.01;
            var energy = moodInfo.energy * this.mood[tag] * 0.01;
            totalEnergy += energy;

            // console.log("Beat", index, this.segment, valence, energy);

            this.particles.push({
                timestamp: this.frameTimestamp,
                segment: this.segment,
                falloff: 20 - energy * 16,
                color: hsv( -valence * 0.5 + 0.1, 0.8, 0.4 + energy * energy),
                angle: index * (Math.PI + 0.2) + valence * 20.0,
                wobble: valence * valence * energy * energy
            });

        } else {
            console.log("Unknown mood", tag);
        }
    }

    var sceneEnergy = 0.1 + totalEnergy * totalEnergy;

    // Change background angle at each beat
    this.rings.angle += (Math.random() - 0.5) * 2.0 * sceneEnergy;
    this.rings.speed = 0.01 * sceneEnergy;
    this.rings.wspeed = 0.02 * sceneEnergy;
    */
};
