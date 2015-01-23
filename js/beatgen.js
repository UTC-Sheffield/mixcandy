Lights.prototype.beatgen_256 = function(index) {
this.aBeats.unshift([
    Math.min(255, Math.round(Math.random()*8)*32), 
    Math.min(255, Math.round(Math.random()*8)*32), 
    Math.min(255, Math.round(Math.random()*8)*32), 
    this.frameTimestamp,
    0
]);

this.aBeats = this.aBeats.slice(0, 10);
this.iBeatLength = (60.0 / this.analysis.features.BPM);
};


Lights.prototype.beatBankColors = [
    [255,0,0],
    [0,255,0],
    [0,0,255],
    [245,46,245],
    [236,131,12],
    [12,236,176]
];


Lights.prototype.beatgen_bank = function(index) {
var aColor = this.beatBankColors[index%this.beatBankColors.length];

this.aBeats.unshift([
    aColor[0], 
    aColor[1], 
    aColor[2], 
    this.frameTimestamp,
    0
]);

this.aBeats = this.aBeats.slice(0, 10);
this.iBeatLength = (60.0 / this.analysis.features.BPM);
};


Lights.prototype.beatgen_callam = function(index) {
var r = 0;
var g = 255;
var b = 0;

if(index % 2 === 0)
{
    g = 0;
    b = 255;
}

this.aBeats.unshift([r, g, b, this.frameTimestamp, 0]);

this.aBeats = this.aBeats.slice(0, 10);
this.iBeatLength = (60.0 / this.analysis.features.BPM);
};
