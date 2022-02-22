#  Data Helpers

A series of helper files in Python to add the initial data to the database. Example datafiles are included in the datafiles directory.

Ensure that config.ini contains credentials for the events database being used

When the database container is built, enter it using `docker exec -it database bash`

Then 
* `su - postgres`
* `cd /usr/local/bin/helpers`
* `./run_helpers.sh`. 
This will add existing location, actor, and event data to the database. Any errors from invalid data will print to stdout.