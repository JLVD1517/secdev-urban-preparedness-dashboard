# Leveraging Python container to use csvkit to create CSV tables
FROM python:3-alpine as csvkit

LABEL MAINTAINER="Brett Gilbert <brett@rs21.io>"

# Install gcc and csvkit
RUN apk add build-base \
	&& pip install csvkit

# Create directory structure
RUN mkdir -p /usr/local/data/scripts


# Start with the PostgreSQL image version we want
FROM postgres:13

# Set args for postgres build
ARG POSTGIS_MAJOR=3

# Set environment variables to be available to container
ENV SCHEMA=secdev

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
RUN mkdir -p /usr/local/data/shapefile
RUN mkdir -p /usr/local/log

RUN chown postgres /usr/local/log

# Copy scripts that will be used to initialize the container
COPY ./docker/pgscripts/*.sh /docker-entrypoint-initdb.d/
COPY ./docker/dbscripts/*.sh /docker-entrypoint-initdb.d/
COPY ./docker/pgscripts/     /usr/local/bin/
COPY ./docker/dbscripts/     /usr/local/bin/


# Copy database schema, functions, and data files
COPY ./src/sql/*.sql                          /usr/local/data/dbschema/
COPY ./docker/data/shapefile/haiti_commune.* /usr/local/data/shapefile/
COPY ./docker/data/shapefile/haiti_subcommune.* /usr/local/data/shapefile/

# Copy the version script and make it executable
COPY ./docker/misc/version.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/version.sh
