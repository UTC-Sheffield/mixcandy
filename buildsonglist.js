var fs = require('fs');
var http = require('http');
http.post = require('http-post');

var aDirs = fs.readdirSync("music/");

var rMatcher = /mp3/;
                
var aSongs = aDirs.filter(function(sFile){
    return rMatcher.test(sFile);
});

aSongs.forEach(function(sFile){
        console.log("sFile =", sFile);
    var sJson = "./music/"+sFile.replace(rMatcher, "json");
    if(!fs.existsSync(sJson)) {
        console.log("sJson =", sJson);
            
        var files = [
            {
                param: "audiofile",
                path: "./music/"+sFile
            }
        ];
        
        http.post('http://devapi.gracenote.com/v1/timeline/', [], files, function(res){
            //res.setEncoding('utf8');
            var aBuffers  = [];
            res.on('data', function(chunk) {
                aBuffers.push( chunk);
            });
            res.on('end', function() {
                    
                var oFullBuffer = Buffer.concat(aBuffers);    
                console.log("oFullBuffer =", oFullBuffer);
                var sFullBuffer = oFullBuffer.toString();
                    console.log("sFullBuffer =", sFullBuffer);
                var aData = JSON.parse(sFullBuffer);
                console.log("aData =", aData);
            });
            
        });
        
    }
});

/*fs.readdir(path, callback)#
Asynchronous readdir(3). Reads the contents of a directory. The callback gets two arguments (err, files)*/
