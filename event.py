#!/usr/bin/env python

import signal,  opc, time, math, random, json
from threading import Timer

file = open('static/data/shield.json', 'r')

layout = json.loads(file.read())
numLEDs = len(layout)

client = opc.Client('localhost:7890')

global pixels, frame, colours, MethodWanted
pixels = [ (0, 0, 0) ] * numLEDs
frame=0

colours = [{"red":255, "green":0, "blue":0}];

colourindex = 0

class renderer:
  def render1(self, (col, row, depth)):
    red = 255 - (row * 8)
    green = abs(64 * (frame % 8) - 255)
    blue = abs(64 * (abs(col - 3)))
    return (red, green, blue)

  def render2(self, (col, row, depth)):
    step = (col + frame) % 3
    if( step == 0):
      return (255, 0, 0)
    if(step == 1):
      return (0, 255, 0)
    if(step == 2):
      return (0, 0, 255)

  def render4(self, (col, row, depth)):
    index = abs(3 - col) % len(colours)
    colour = colours[index]
    #print (index, colour)
    return (colour["red"], colour["green"], colour["blue"])
      
Rend = renderer();  


import types


funcText = """def render3(self, (col, row, depth)):
  twinkle = random.randint(0,200)
  return (255, twinkle, twinkle )
"""

exec(funcText)
Rend.render3 = types.MethodType( render3, Rend )

funcNum = 1
MethodWanted = "render1";

delay = 0.1


def doFrame():
  global frame, MethodWanted, funcNum
  frame = frame + 1
  if(frame % 50 == 0):
    funcNum += 1
    if(funcNum == 5):
      funcNum = 1
    MethodWanted = 'render'+str(funcNum)
    print (funcNum, MethodWanted)
    
  for pixel in range(numLEDs):
    pixels[pixel] = getattr(Rend, MethodWanted)(layout[pixel]['point'])
  client.put_pixels(pixels)
  t = Timer(delay, doFrame)
  t.start()
  #time.sleep(delay)
  #doFrame()
  
#doFrame()
t = Timer(delay, doFrame)
t.start()  # after 30 seconds, "hello, world" 

import explorerhat

def handle(self):
  colours.insert(0, {"red":random.randint(0,255), "green":random.randint(0,255), "blue":random.randint(0,255)})
  print(len(colours))
  
explorerhat.input.one.pressed(handle)

explorerhat.pause()
