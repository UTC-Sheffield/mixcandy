
Lights.prototype.horizontal = function(aPoint) {
    // aPoint = [x,y,z]
    var aBeat = this.aBeats[aPoint[2] % this.aBeats.length];
    //console.log("aBeat =", aBeat);
    //aBeat[r,g,b, time beat started, beats since beat.]
    var r = aBeat[0];
    var g = aBeat[1];
    var b = aBeat[2];
     
    return [r, g, b];

};



Lights.prototype.lauren_skye = function(aPoint) {
    // aPoint = [x,y,z]
    var aOut = [2,1,0,0,1,2];
    var iRow = aOut[aPoint[2]]  % this.aBeats.length;
    var aBeat = this.aBeats[iRow];
    //aBeat[r,g,b, time beat started, beats since beat.]
    var r = aBeat[0];
    var g = aBeat[1];
    var b = aBeat[2];
     
    return [r, g, b];

};


Lights.prototype.calam = function(aPoint) {
    // aPoint = [x,y,z]
    var aOut = [2,1,0,0,1,2];
    var iRow = aOut[aPoint[2]]  % this.aBeats.length;
    var aBeat = this.aBeats[iRow];
    //aBeat[r,g,b, time beat started, beats since beat.]
    var r = aBeat[0];
    var g = aBeat[1];
    var b = aBeat[2];
    
    
     
    return [r, g, b];

};


Lights.prototype.horizontalTime = function(aPoint) {
    var iRow = aPoint[2]  % this.aBeats.length;
    var aBeat = this.aBeats[iRow];
    var r = Math.round(Math.max(0, aBeat[0] * (10 - aBeat[4] ) / 10));
    var g = Math.round(Math.max(0, aBeat[1] * (10 - aBeat[4] ) / 10));
    var b = Math.round(Math.max(0, aBeat[2] * (10 - aBeat[4] ) / 10));
     
    return [r, g, b];
};


Lights.prototype.horizontalTimeCenter = function(aPoint) {
    var aOut = [2,1,0,0,1,2];
    var iRow = aOut[aPoint[2]]  % this.aBeats.length;
    var aBeat = this.aBeats[iRow];
    var r = Math.round(Math.max(0, aBeat[0] * (4 - aBeat[4] ) / 4));
    var g = Math.round(Math.max(0, aBeat[1] * (4 - aBeat[4] ) / 4));
    var b = Math.round(Math.max(0, aBeat[2] * (4 - aBeat[4] ) / 4));
     
    return [r, g, b];
};


Lights.prototype.frozen = function(aPoint) {
    var aOut = [2,1,0,0,1,2];
    var iRow = aOut[aPoint[2]]  % this.aBeats.length;
    var aBeat = this.aBeats[iRow];
    var iWobble = Math.sin((aPoint[0]+aBeat[4] )/10 * Math.PI) * 64;
    //console.log("iWobble =", iWobble);
    // TODO : faster fade at bottom
    var r = Math.round(Math.max(0, Math.min(255, (128 + (aBeat[0]/2) * (4 - aBeat[4] ) / 4) - iWobble)));
    var g = Math.round(Math.max(0, Math.min(255, (128 + (aBeat[1]/2) * (4 - aBeat[4] ) / 4) - iWobble)));
    var b = 255;//Math.min((255 * (4 - aBeat[4] ) / 3) - iWobble); // the blue starts at max
    return [r, g, b];
};


