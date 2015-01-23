// TODO : UV meter
// TODO : down

Lights.prototype.rgb_horizontal = function(aPoint) {
var aBeat = this.aBeats[aPoint[2] % this.aBeats.length];

var r = aBeat[0];
var g = aBeat[1];
var b = aBeat[2];

return [r, g, b];
};

Lights.prototype.rgb_vertical = function(aPoint) {
var aBeat = this.aBeats[aPoint[0] % this.aBeats.length];

var r = aBeat[0];
var g = aBeat[1];
var b = aBeat[2];

return [r, g, b];
};

Lights.prototype.rgb_lauren_skye = function(aPoint) {
var aOut = [2,1,0,0,1,2];
var iRow = aOut[aPoint[2]]  % this.aBeats.length;
var aBeat = this.aBeats[iRow];

var r = aBeat[0];
var g = aBeat[1];
var b = aBeat[2];

return [r, g, b];
};


Lights.prototype.rgb_horizontalTime = function(aPoint) {
var iRow = aPoint[2]  % this.aBeats.length;
var aBeat = this.aBeats[iRow];

var r = Math.round(Math.max(128, aBeat[0] * (10 - aBeat[4] ) / 10));
var g = Math.round(Math.max(128, aBeat[1] * (10 - aBeat[4] ) / 10));
var b = Math.round(Math.max(128, aBeat[2] * (10 - aBeat[4] ) / 10));     

return [r, g, b];
};


Lights.prototype.rgb_center_fade = function(aPoint) {
var aOut = [2,1,0,0,1,2];
var iRow = aOut[aPoint[2]]  % this.aBeats.length;
var aBeat = this.aBeats[iRow];

var r = Math.round(Math.max(0, aBeat[0] * (4 - aBeat[4] ) / 4));
var g = Math.round(Math.max(0, aBeat[1] * (4 - aBeat[4] ) / 4));
var b = Math.round(Math.max(0, aBeat[2] * (4 - aBeat[4] ) / 4));
 
return [r, g, b];
};


Lights.prototype.rgb_frozen = function(aPoint) {
var aOut = [2,1,0,0,1,2];
var iRow = aOut[aPoint[2]]  % this.aBeats.length;
var aBeat = this.aBeats[iRow];
var iWobble = Math.sin((aPoint[0]+aBeat[4] )/10 * Math.PI) * 64;

var r = Math.round(Math.max(0, Math.min(255, (128 + (aBeat[0]/2) * (4 - aBeat[4] ) / 4) - iWobble)));
var g = Math.round(Math.max(0, Math.min(255, (128 + (aBeat[1]/2) * (4 - aBeat[4] ) / 4) - iWobble)));
var b = 255;

return [r, g, b];
};

Lights.prototype.rgb_blocksdown = function(aPoint) {
var iRow = Math.floor(aPoint[0]/3) % this.aBeats.length;
var aBeat = this.aBeats[iRow];

var r = aBeat[0];
var g = aBeat[1];
var b = aBeat[2];

return [r, g, b];
};

Lights.prototype.rgb_fadedown = function(aPoint) {
var aOut = [2,1,0,0,1,2];
var iRow = aOut[aPoint[2]]  % this.aBeats.length;
var aBeat = this.aBeats[iRow];

var r = Math.round(aBeat[0] * (1-(aPoint[0]/30)));
var g = Math.round(aBeat[1] * (1-(aPoint[0]/30)));
var b = Math.round(aBeat[2] * (1-(aPoint[0]/30)));

return [r, g, b];
}
