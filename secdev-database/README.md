# secdev-database
Data storage for the SECDEV CVR project.

## usage
This contianer can be launched alone, but is meant to be built in conjunction with the secdev-tile-server container by the secdev-docker-compose file. For directions to use the docker-compose, see the docker-compose readme. 

In order for data to be able to be ingested by this container, there are some rules that must be followed.
 - Shapefile: 
    - A single, valid shapefile (which is a set of individual files) should be named `city_geography` and placed in `/docker/data/shapefile`.
    - This shapefile should contain tract information for the area of interest. 
    - The shapefile should contain a column called `tractce` which will be used to join the shapefile data to the csv data via tract fips code.
    - The geometric data must be in the EPGS:4326(wgs84) projection. 
 - Asset CSVs:
    - Place as many point-based, properly formatted csvs as desired in `/docker/data/csv/assets`
    - Files names should be all lower case and only include letters, numbers, and underscores and never start with a number.
    - The first line of the file should be a header and follow the same conventions as the file name.
    - File titles will be used to generate tables and later be used by the tile server to request data. 
    - Each CSV must contain a column named `latitude` and a column named `longitude` that contains coordinates for the asset in the EPGS:4326(wgs84) projection.