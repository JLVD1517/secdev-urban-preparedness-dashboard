#!/bin/sh

# initial variables
timestamp=$(date +%Y%m%d%H%M)
logPath=/usr/local/log
logData=$logPath/$timestamp-load-data.log

# exit immediately when a command exits with a non-zero status
set -e

echo "Load shapefiles..." 2>&1 | tee -a $logData

for f in $(ls /usr/local/data/shapefile/*.shp); do
    echo "  loading shapefile data $f..." 2>&1 | tee -a $logData
    NAME=`echo $f | sed 's:.*/::' | cut -d'.' -f1`
    shp2pgsql -s 4326 -I $f ${SCHEMA}.${NAME} | psql -d ${DB} -U ${POSTGRES_USER} 2>&1 | tee -a $logData | grep -Ev "INSERT 0 1|^$"
done

echo "done loading shapefiles." 2>&1 | tee -a $logData
