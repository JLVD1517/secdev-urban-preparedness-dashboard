# SECDEV CVR Dashboard Application Deployment Guide

### Version 1.0

## Introduction

This document will walk you through the process of deploying your own local version of the [Secdev Community Violence Reduction Dashboard Application](https://google.com) (referred to as secdev cvr or ‘the application’).

For your convenience, we have provided a `main` git branch that includes all assets required to run the application for Haiti.

You can view a live demo of the Secdev CVR dashboard [here](https://google.com)

## Structure

There are four main subdirectories, each representing a component of the application.

- `secdev-docker-compose`: Contains docker-compose file for easy deployment of all components. Only potential changes needed involve changing ports depending on your deployment needs.
- `secdev-tile-server`: Contains the code to initalize the tile server for the map - the coloured heatmap tiles and the points of interest are shown by querying this server
- `secdev-database`: Contains the code to initialize all datasets for the map, including importing points of interest and shapefile from user-added files.
- `secdev-application`: Contains all the front end code. This is the directory that will require the most customization to deploy your own version.

Please refer to the corresponding folder ReadMe file for detailed explanation of respective application.

## Prerequisites

- Docker Engine
- Server running Ubuntu or Mac OS with >= 4GB RAM
- Approximately 6 GB of hard drive space
- A [Mapbox API key](https://docs.mapbox.com/help/getting-started/access-tokens/) with default permissions

## Environment

- It’s strongly recommended that you set up npm (via installing [Node.js](https://nodejs.org/en/download/)) to run the application side independently and test small visual or textual changes
- This application was developed and tested in Mac OS and Ubuntu. It may not behave as expected when deployed to a Windows server.

## Local Deployment Checklist

1. Docker is installed and running - [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/ubuntu/)
2. Node.js is installed - [https://nodejs.org/en/](https://nodejs.org/en/)


## Application Deployment steps

1. Git clone the repository ((link here))
2. Create .env file inside secdev-application and secdev-tile-server folders
3. Add the following environment variables in secdev-application/.env file
- `REACT_APP_MAPBOX_ACCESS_TOKEN`
  - This variable sets the appropriate MapBox access token. For more information about MapBox Access Tokens see [the MapBox documentation on access tokens.](https://docs.mapbox.com/help/getting-started/access-tokens/)
- `REACT_APP_MAP_TILESERVER_URL`
  - This variable sets the base url for the tile server.
- `REACT_APP_ENDPOINT_URL`
  - This variable sets the base url for other rest endpoints called in the application.
4. Get and Add Mapbox API key to secdev-application/.env
5. Edit src/sql/00_db_setup.sql to include secure passwords instead of default value
6. Set the changed database credentials in secdev-tile-server/.env file
- `DB_USER`
  - database user name
- `DB_PASSWORD`
  - database password
7. Check docker-compose.yml in secdev-docker-compose to ensure that none of the ports are already in use. If they are, change them only on the left side of the colon (eg. `80:80` may become `81:80` if port 80 is already in use
8. Use the command `docker-compose up --build` to build the entire project. Pay attention to any error messages that may appear, particularly when the database is being initialized
9. If there are database errors, use `ctrl+c` to stop the programs and then use the command `docker system prune` to fully remove the database that was set up. This helps to ensure that old errors won’t crop up again unexpectedly
10. When you have verified everything is working correctly, you can stop (ctrl+c) and restart the program using the command `secdev-docker-compose up --build -d` - this starts it in the background.
11. Verify that the three program components - database, tile server, and application - are running using the command ‘docker ps’
12. Visit `localhost:8080` to view the application on your local server

## Troubleshooting

* Running `npm run start` from the command line in the secdev-application directory will stand up a version of the front end at `localhost:3000`. It can still access the tile server and database as long as they are still running.
    * If you have not done so before, you should run `npm install` first to ensure all appropriate packages are installed.
    * `npm run start` can be used to check changes made to the front end only, such as changes to `app-config.ts`, as it will create a hot-loading instance of the application.
* If the database is built with inaccurate data, remove the image using `docker rm database` and re-build once the data has been corrected
* If changes have been made to different parts of the program, it may be helpful to stop all secdev images and run `docker system prune` to clean them up before rebuilding
* If a production deploy is desired, be sure to
    * Search all directories for `localhost` and change as appropriate
    * Ensure that all database credentials have been changed appropriately.



## Data File Requirements

There are three main types of data files, all of which are located in the `secdev-database/docker/data` folder.

### All Data Files

- File names and column names must not contain any characters other than a-z (lowercase only), 0-9, and the underscore character (`_`)
- Spaces, hyphens, capital letters, or other characters may cause errors when initializing the database or when connecting the database to the app.
- Keep track of the names of the columns you would like to show on the front end of the application

### Assets / Points of Interest

- These files are to enable a view that includes important landmarks
- Files should be separated by landmark type - for example, libraries and hospitals would be in separate .csv files
- They should have at least 3 columns:
  - a column for the label you wish to show on the front end
  - ‘latitude’
  - ‘longitude’
- Note the name of the label column for use with secdev-application later.
- Files must be .csv files located in secdev-database/docker/data/csv/assets

### Shapefiles
- Should contain two shape files.
- File having Commune shapes must be named `haiti_commune.shp` and be located in `secdev-database/docker/data/shapefile`
- File having Commune shapes must be named `haiti_subcommune.shp` and be located in `secdev-database/docker/data/shapefile`
- The column name `gid`, which uniquely identify the commune in haiti_commune shape file and sub-commune in haiti_subcomune shape file, should be present in both the shape files.
- If there are special characters in the shapefile that go beyond UTF-8, you may have to modify line 52 of secdev-database/docker/dbscripts/02-load-data.sh to change the character set used for the postgis database

**Example Alteration: secdev-database/docker/dbscripts/02-load-data.sh, lines 36-40**

Default - no -W flag is given, so the conversion from shapefile to postgis compatible data is done assuming the character setting should be in UTF-8

```
    for f in $(ls /usr/local/data/shapefile/*.shp); do
       echo "  loading shapefile data $f..." 2>&1 | tee -a $logData
       NAME=`echo $f | sed 's:.*/::' | cut -d'.' -f1`
       shp2pgsql -s 4326 -I $f ${SCHEMA}.${NAME} | psql -d ${DB} -U ${POSTGRES_USER} 2>&1 | tee -a $logData | grep -Ev "INSERT 0 1|^$"
```

## Front End Application Configuration

`secdev-application/src/configuration` contains three files for customizing the front end of the application.



###  Application Configuration

app-config.ts

The bulk of the front end configuration happens in this file. Please be sure to review app-config carefully before deploying.
