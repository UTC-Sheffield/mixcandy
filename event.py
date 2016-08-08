#!/usr/bin/env python

# Light each LED in sequence, and repeat.

import opc, time, math

file = open('static/data/shield.json', 'r')

import json
layout = json.loads(file.read())

numLEDs = len(layout)
client = opc.Client('localhost:7890')

global pixels, frame
pixels = [ (0, 0, 0) ] * numLEDs
frame=0

def render1((col, row, depth)):
  red = 255 - (row * 8)
  green = abs(64 * (frame % 8) - 255)
  blue = abs(64 * (abs(col - 3)))
  return (red, green, blue)
  
  
while True:
  frame = frame + 1
  for pixel in range(numLEDs):
    pixels[pixel] = render1(layout[pixel]['point'])
  client.put_pixels(pixels)
  time.sleep(0.5)
