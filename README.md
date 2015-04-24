Mixcandy
========

Project by Univesity Techincal College Sheffield - Tech Group Enrichment.

Mixcandy listens to music and flashes lights (Neopixels connected through Raspberry Pi via a Fadecandy). 

It now runs on a Raspberry Pi and provides a web interface that allows the user to select different colour and pattern generation algorithms and even change the code being executed live. We now have a live preview and a live coding interface to change the lights patterns live. 

The project uses the Fadecandy server for raspberry pi https://github.com/scanlime/fadecandy , http://ace.c9.io/ and HTML5 getUserMedia() to listen to audio through a web browsers access to a microphone. LED visualization frames are computed in JavaScript and sent to the Fadecandy daemon over WebSockets. 

See it in action here https://www.youtube.com/watch?v=fxQHm8L_ReE

Credits
=======

Code is now only very loosley based on stuff written by the guys at scanlime, who built a live performance tool that combines music analysis, MIDI controller input, and real-time LED light visuals.
