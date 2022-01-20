# Leveraging Python container to use csvkit to create CSV tables
FROM python:3-alpine as csvkit

LABEL MAINTAINER="Brett Gilbert <brett@rs21.io>"

# Install gcc and csvkit
RUN apk add build-base \
	&& pip install csvkit

# Create directory structure
RUN mkdir -p /usr/local/data/csv/done
RUN mkdir -p /usr/local/data/scripts

# Move csvs for area of interest into working directory
#COPY ./docker/data/csv/indices/current_indices.csv /usr/local/data/csv/city_metrics.csv
COPY ./docker/data/csv/assets/*.csv                /usr/local/data/csv/

# Move load script and make it executable
COPY ./docker/pyscripts/load-csv.sh /usr/local/data/scripts/

RUN chmod +x /usr/local/data/scripts/load-csv.sh

# Run load script
RUN ./usr/local/data/scripts/load-csv.sh

# Start with the PostgreSQL image version we want
FROM postgres:13

# Set args for postgres build
ARG POSTGIS_MAJOR=3

# Set environment variables to be available to container
ENV SCHEMA=uppd

# Update the package list and install PostGIS
RUN apt-get update \
	&& apt-cache showpkg postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR \
	&& apt-get install -y --no-install-recommends \
	postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR \
	postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR-scripts \
	postgis \
	&& rm -rf /var/lib/apt/lists/*

# Create directories in the image to store scripts and files
RUN mkdir -p /docker-entrypoint-initdb.d
RUN mkdir -p /usr/local/data/dbdata
RUN mkdir -p /usr/local/data/dbschema
RUN mkdir -p /usr/local/data/dbviews
RUN mkdir -p /usr/local/data/shapefile
RUN mkdir -p /usr/local/data/csv
#RUN mkdir -p /usr/local/data/csv-indices
RUN mkdir -p /usr/local/log

RUN chown postgres /usr/local/log

# Copy scripts that will be used to initialize the container
COPY ./docker/pgscripts/*.sh /docker-entrypoint-initdb.d/
COPY ./docker/dbscripts/*.sh /docker-entrypoint-initdb.d/
COPY ./docker/pgscripts/     /usr/local/bin/
COPY ./docker/dbscripts/     /usr/local/bin/

# Copy csv tables from python to postgres container
COPY --from=csvkit /usr/local/data/csv/done/*.sql /usr/local/data/dbschema/

# Copy database schema, functions, and data files
COPY ./src/sql/*.sql                          /usr/local/data/dbschema/
COPY ./src/sql/views/*.sql                    /usr/local/data/dbviews/
COPY ./docker/data/shapefile/haiti_commune.* /usr/local/data/shapefile/
COPY ./docker/data/shapefile/haiti_subcommune.* /usr/local/data/shapefile/
COPY ./docker/data/csv/assets/*.csv           /usr/local/data/csv-assets/
#COPY ./docker/data/csv/indices/*.csv          /usr/local/data/csv-indices/

# Copy the version script and make it executable
COPY ./docker/misc/version.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/version.sh
