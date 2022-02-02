# uppd-docker-compose
Docker-compose file for the Haiti violence monitor  project.
## usage
In order for this docker-compose file to successfully build the HVM projects, several requirements must be met:
1. Your docker must have access to 4gb of ram in order to build the application.
2. The project must be arranged in the following file structure. Each repo should be contained within the folders specified below. It doesn't matter where these folders are located as long as they are on the same level and named properly. This docker-compose should be located at uppd-docker-compose/docker-compose.yml. The Dockerfile for the DB should be located at uppd-database/Dockerfile, the tile server at uppd-tile-server/Dockerfile, and the application at uppd-application/Dockerfile.
    - uppd-docker-compose
    - uppd-database
    - uppd-tile-server
    - uppd-application
3. data for the project must be the proper type, format, and must be placed in the proper folders in the DB directory. For more information about these requirements, see the DB readme.
4. Once 1, 2, and 3 are complete, the project can be built and run (with the -d flag to run it in the background) via:
```
docker-compose up --build
```
5. It can then be shut down via `ctrl-c` keypress in the foreground or `docker-compose down` command in the background.  