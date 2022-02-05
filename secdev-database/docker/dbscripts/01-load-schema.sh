#!/bin/sh

# initial variables
timestamp=$(date +%Y%m%d%H%M)
logPath=/usr/local/log
logSchema=$logPath/$timestamp-load-schema.log

# exit immediately when a command exits with a non-zero status
set -e

echo "Load schema..." 2>&1 | tee -a $logSchema

for f in $(ls /usr/local/data/dbschema/*.sql); do
    echo "  loading schema $f..." 2>&1 | tee -a $logSchema
    psql $DB -c "\i $f" 2>&1 | tee -a $logSchema
done

echo "done loading schema." 2>&1 | tee -a $logSchema
