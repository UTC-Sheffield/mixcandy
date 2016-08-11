import types, random

class pixel_renderer:
  funcList = ["rainbowish", "primary", "plain"]
  funcNum = 0
  frame = 0
  
  def setFrame(self, frame):
    self.frame = frame
    
  def render(self, Point, colour):
    return getattr(self, self.funcList[self.funcNum])(Point, colour, self.frame)
    
  def next(self):
    self.funcNum = (self.funcNum +1) % len(self.funcList)
    #print(self.funcList[self.funcNum])
  
  def shuffle(self):
    self.funcNum = (self.funcNum +1) % len(self.funcList)
    print(self.funcNum)
  
  def addMethod(self, name, code):
    print (name, code)
    funcText = "def newFunc(self, (col, row, depth), colour, frame):\n"+code
    exec(funcText)
    setattr(self, name, types.MethodType( newFunc, self ))
    self.funcList.append(name)
  
  def plain(self, (col, row, depth), colour, frame):
    return (colour["red"], colour["green"], colour["blue"])
    
  def rainbowish(self, (col, row, depth), colour, frame):
    red = 255 - (row * 8)
    green = abs(64 * (frame % 8) - 255)
    blue = abs(64 * (abs(col - 3)))
    return (red, green, blue)

  def primary(self, (col, row, depth), colour, frame):
    step = (col + round(frame/4)) % 3
    if( step == 0):
      return (255, 0, 0)
    if(step == 1):
      return (0, 255, 0)
    if(step == 2):
      return (0, 0, 255)

