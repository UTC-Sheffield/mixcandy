import types

class position_colours:
  funcList = ["horizontal_centre", "vertical_centre", "horizontal_right",
  "vertical_up", "horizontal_left", "vertical_down" ]
  funcNum = 0
  vertBandSize = 3
  
  def getColour(self, Point, colours):
    return getattr(self, self.funcList[self.funcNum])(Point, colours)
    
  def next(self):
    self.funcNum = (self.funcNum +1) % len(self.funcList)
    print(self.funcList[self.funcNum])
  
  def shuffle(self):
    self.funcNum = (self.funcNum +1) % len(self.funcList)
    print(self.funcNum)
  
  def addMethod(self, name, code):
    print (name, code)
    funcText = "def newFunc(self, (col, row, depth), colours):\n"+code
    exec(funcText)
    setattr(self, name, types.MethodType( newFunc, self ))
    self.funcList.append(name)
  
  # TODO : fix centre
  def horizontal_centre(self, (col, row, depth), colours):
    index = abs(3 - col) % len(colours)
    colour = colours[index]
    return colour
   
  def horizontal_left(self, (col, row, depth), colours):
    index = col % len(colours)
    colour = colours[index]
    return colour  
    
  def horizontal_right(self, (col, row, depth), colours):
    index = (5 - col) % len(colours)
    colour = colours[index]
    return colour  
  
  # TODO : Add a height - vertBandSize
  def vertical_centre(self, (col, row, depth), colours):
    index = abs(15 - row) % len(colours)
    colour = colours[index]
    return colour
   
  def vertical_down(self, (col, row, depth), colours):
    index = row % len(colours)
    colour = colours[index]
    return colour  
    
  def vertical_up(self, (col, row, depth), colours):
    index = (30 - row) % len(colours)
    colour = colours[index]
    return colour  
