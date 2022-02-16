#!/bin/bash

su - postgres
cd /usr/local/bin/helpers
pip3 install -r requirements.txt
python3 add_locations.py
python3 add_actor_data.py
python3 add_event_data.py --date 2020-12-31

command="su - postgres && cd /usr/local/bin/helpers && python3 add_event_data.py"
job="0 14 * * * $command"
cat <(fgrep -i -v "$command" <(crontab -l)) <(echo "$job") | crontab -
