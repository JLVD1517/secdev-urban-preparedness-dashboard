#!/bin/bash

cd /usr/local/bin/helpers
pip3 install -r requirements.txt
python3 add_locations.py
python3 add_actor_data.py
python3 add_event_data.py --date 2020-12-31
