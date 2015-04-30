Lights.prototype.beatgen_256 = function(index) {
this.aBeats.unshift([//Adds at start of this.aBeats
    Math.min(255, Math.round(Math.random()*8)*32), //Red
    Math.min(255, Math.round(Math.random()*8)*32), //Green
    Math.min(255, Math.round(Math.random()*8)*32), //Blue
    this.frameTimestamp,//When did this beat start
    0, //How long since this beat started
    0
]);

this.aBeats = this.aBeats.slice(0, 10); //Make sure this.aBeats not too big
this.iBeatLength = (60.0 / this.BPM); //How long is a beat
};

Lights.prototype.beatgen_64 = function(index) {
this.aBeats.unshift([ //Adds at start of this.aBeats
    Math.min(255, Math.round(Math.random()*4)*64), //Red
    Math.min(255, Math.round(Math.random()*4)*64), //Green 
    Math.min(255, Math.round(Math.random()*4)*64), //Blue
    this.frameTimestamp, //When did this beat start
    0, //How long since this beat started
    0
]);

this.aBeats = this.aBeats.slice(0, 10); //Make sure this.aBeats not too big
this.iBeatLength = (60.0 / this.BPM); //How long is a beat
};

Lights.prototype.beatgen_random = function(index) {

this.aBeats.unshift([//Adds at start of this.aBeats
    Math.round(Math.random()*255), //Red
    Math.round(Math.random()*255), //Green
    Math.round(Math.random()*255), //Blue
    this.frameTimestamp,//When did this beat start
    0//How long since this beat started
]);

this.aBeats = this.aBeats.slice(0, 6); //Make sure this.aBeats not too big
this.iBeatLength = (60.0 / this.BPM); //How long is a beat
};

Lights.prototype.beatBankColors = [
    [255,0,0],
    [0,255,0],
    [0,0,255],
    [245,46,245],
    [12,236,176]
];


Lights.prototype.beatgen_bank = function(index) {
var aColor = this.beatBankColors[index%this.beatBankColors.length];

this.aBeats.unshift([//Adds at start of this.aBeats
    aColor[0], //Red
    aColor[1], //Green
    aColor[2], //Blue
    this.frameTimestamp,//When did this beat start
    0,//How long since this beat started
    index%10
]);

this.aBeats = this.aBeats.slice(0, 10); //Make sure this.aBeats not too big
this.iBeatLength = (60.0 / this.BPM); //How long is a beat
};


Lights.prototype.beatgen_callam = function(index) {
var r = 0;   //Red
var g = 255; //Green
var b = 0;   //Blue

if(index % 2 === 0) //Every second beat make it blue
{
    g = 0; 
    b = 255;
}

this.aBeats.unshift([r, g, b, this.frameTimestamp, 0]); //Adds at start of this.aBeats

this.aBeats = this.aBeats.slice(0, 10); //Make sure this.aBeats not too big
this.iBeatLength = (60.0 / this.BPM); //How long is a beat
};

Lights.prototype.beatgen_hsv_cycle = function(index) {
var aColour = hsv((index % 20)/20, 1, 1);
aColour[3] = this.frameTimestamp; //When did this beat start
aColour[4] = 0; //How long since this beat started

this.aBeats.unshift(aColour); //Adds at start of this.aBeats

this.aBeats = this.aBeats.slice(0, 20); //Make sure this.aBeats not too big
this.iBeatLength = (60.0 / this.BPM); //How long is a beat
};

Lights.prototype.beatgen_hsv_random = function(index) {
var aColour = hsv(Math.random(), 1, 1);
aColour[3] = this.frameTimestamp; //When did this beat start
aColour[4] = 0; //How long since this beat started

this.aBeats.unshift(aColour); //Adds at start of this.aBeats

this.aBeats = this.aBeats.slice(0, 20); //Make sure this.aBeats not too big
this.iBeatLength = (60.0 / this.BPM); //How long is a beat
};
