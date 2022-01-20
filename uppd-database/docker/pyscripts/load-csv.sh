#!/bin/sh

for f in $(ls /usr/local/data/csv/*.csv); do
    echo "  loading csv $f..."
    NAME=`echo $f | sed 's:.*/::' | cut -d'.' -f1`
    echo " name decided $NAME"
    csvsql -i postgresql $f > /usr/local/data/csv/done/01_${NAME}.sql
done