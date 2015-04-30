#!/bin/bash
sudo ./fadecandy/bin/fcserver-rpi conf.json &
sudo python mixserver.py &
