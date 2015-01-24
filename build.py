import requests
from time import sleep
import pdb
import glob
import os
import json

aSongs = glob.glob('music/*.mp3')
print aSongs

aMusic = []


url = "http://devapi.gracenote.com/v1/timeline/"

for sSong in aSongs:
    (root, ext) = os.path.splitext(sSong)
    sJSON = root+".json";
    bExists = os.path.exists(sJSON)
    if not bExists:    
        print("sJSON =", sJSON)
        resp = requests.post(url,files={'audiofile':open(sSong,'rb')})
        jresp = resp.json()
        id = jresp['id']
        
        progress = float(jresp['progress'])
        
        while progress < 1:
            sleep(10)
            resp = requests.get(url + str(id) +'/')
            jresp = resp.json()
            progress = float(jresp['progress'])
        
        with open(sJSON, 'w') as outfile:
            json.dump(jresp, outfile)

    aMusic.append({"songURL": sSong, "analysisURL":sJSON})
    
print aMusic
with open("songs.json", 'w') as outfile:
    json.dump(aMusic, outfile)
    
print "Have written to songs.json"
