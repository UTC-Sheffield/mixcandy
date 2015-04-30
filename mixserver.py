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
    
    
    
