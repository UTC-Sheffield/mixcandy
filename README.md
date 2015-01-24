Mixcandy
========

Project for Tech Group Enrichment.

The guys at scanlime built a live performance tool that combines music analysis, MIDI controller input, and real-time LED light visuals.

We want something similar but our students will be coding the actual effects.

Songs are analyzed for beat, mood, and segmentation using Gracenote's timeline API. 
to do this run "python build.py" and it will scan your music folder

We now have a live preview and a live coding interface to change the lights patterns live.

The project runs entirely in the browser, using the Web MIDI API, Howler.js, and Fadecandy. Audio output is handled by rapidly seeking pre-cached tracks, and LED visualization frames are computed in JavaScript and sent to the Fadecandy daemon over WebSockets. Low latency and high frame rate make Mixcandy deliciously smooth, and so much fun that we have a hard time walking away from it.

Credits
=======

Making me Nervous - by Brad Sucks - http://www.bradsucks.net/music/making-me-nervous/
