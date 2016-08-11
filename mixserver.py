#!/usr/bin/env python

import signal,  opc, time, math, random, json, types
from threading import Timer

file = open('static/data/shield.json', 'r')
layout = json.loads(file.read())
numLEDs = len(layout)

client = opc.Client('localhost:7890')

global pixels, frame, colours
pixels = [ (0, 0, 0) ] * numLEDs
frame=0
colours = [{"red":255, "green":0, "blue":0}];

import position_colours, pixel_renderer
    
Rend = pixel_renderer.pixel_renderer();  
PosCol = position_colours.position_colours();

Rend.addMethod("twinkle", """
  twinkle = random.randint(0,200)
  return (255, twinkle, twinkle )
""")

PosCol.addMethod( "horizontal_centre2", """
    index = abs(3 - col) % len(colours)
    colour = colours[index]
    return colour
""")

PosCol.addMethod( "horizontal_left2", """
    index = col % len(colours)
    colour = colours[index]
    return colour  
""")

delay = 0.1 # Time between frames in seconds

def doFrame():
  global frame
  frame = frame + 1
  #party mode type things
  if(frame % 50 == 0):
    Rend.next()
  if(frame % 300 == 0):
    PosCol.next()
  
  Rend.setFrame(frame)
  
  for pixel in range(numLEDs):
    colour =   PosCol.getColour(layout[pixel]['point'], colours)
    pixels[pixel] = Rend.render(layout[pixel]['point'], colour)
  client.put_pixels(pixels)
  t = Timer(delay, doFrame)
  t.start() #start the timer, dealying until the next frame. but none blocking
  
doFrame() #Do the first render

#Sound sensor code
# TODO : add microphone / audio code
import explorerhat

def handle(self): # TODO : add a colour of the right type to the colour bank
  colours.insert(0, {"red":random.randint(0,255), "green":random.randint(0,255), "blue":random.randint(0,255)})
  
explorerhat.input.one.pressed(handle) # when the sound sensor picks something up



import cherrypy
import string  

#pip install cherrypy
cherrypy.config.update("server.conf")

class MixServer(object):
    def __init__(self):
       print "hi" 

    @cherrypy.expose
    def index(self):
        raise cherrypy.HTTPRedirect("/index.html")
        
    
    
if __name__ == '__main__':
    cherrypy.quickstart(MixServer(), config="app.conf")
    
explorerhat.pause() # ??
    
