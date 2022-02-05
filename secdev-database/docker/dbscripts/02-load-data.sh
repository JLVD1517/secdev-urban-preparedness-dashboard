#!/bin/sh

# initial variables
timestamp=$(date +%Y%m%d%H%M)
logPath=/usr/local/log
logData=$logPath/$timestamp-load-data.log

# exit immediately when a command exits with a non-zero status
set -e

echo "Load sql data..." 2>&1 | tee -a $logData

for f in $(ls /usr/local/data/dbdata/*.sql); do
    echo "  loading sql data $f..." 2>&1 | tee -a $logData
    psql $DB -c "\i $f" 2>&1 | tee -a $logData
done

echo "Load csv asset data..." 2>&1 | tee -a $logData

for f in $(ls /usr/local/data/csv-assets/*.csv); do
    echo "  loading csv asset data $f..." 2>&1 | tee -a $logData
    NAME=`echo $f | sed 's:.*/::' | cut -d'.' -f1`
    psql $DB -c "COPY ${NAME} FROM '$f' DELIMITER ',' CSV HEADER;" 2>&1 | tee -a $logData
    psql $DB -c "ALTER TABLE ${NAME} ADD COLUMN geom geometry(Point, 4326);"
    psql $DB -c "UPDATE ${NAME} SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);"
    psql $DB -c "ALTER TABLE ${NAME} ADD COLUMN IF NOT EXISTS gid SERIAL PRIMARY KEY;"
done

echo "done loading csv asset data." 2>&1 | tee -a $logData

echo "Load csv indices data..." 2>&1 | tee -a $logData


echo "Load shapefiles..." 2>&1 | tee -a $logData

for f in $(ls /usr/local/data/shapefile/*.shp); do
    echo "  loading shapefile data $f..." 2>&1 | tee -a $logData
    NAME=`echo $f | sed 's:.*/::' | cut -d'.' -f1`
    shp2pgsql -s 4326 -I $f ${SCHEMA}.${NAME} | psql -d ${DB} -U ${POSTGRES_USER} 2>&1 | tee -a $logData | grep -Ev "INSERT 0 1|^$"
done

echo "done loading shapefiles." 2>&1 | tee -a $logData