# UPPD Application Deployment Guide

### Version 1.0

## Changelog

<table>
  <tr>
   <td>Date
   </td>
   <td>Description of Major Changes
   </td>
   <td>Editor
   </td>
  </tr>
  <tr>
   <td>2021-08-05
   </td>
   <td>Turn loose deployment notes into formal guide
   </td>
   <td>Jamie
   </td>
  </tr>
  <tr>
   <td>2021-08-09
   </td>
   <td>Complete deployment checklist
   </td>
   <td>Jamie
   </td>
  </tr>
  <tr>
   <td>2021-09-13
   </td>
   <td>Review comments + add example code changes
   </td>
   <td>Jamie
   </td>
  </tr>
  <tr>
   <td>2021-09-15
   </td>
   <td>Final revisions for V1
   </td>
   <td>Jamie
   </td>
  </tr>
</table>

## Introduction

This document will walk you through the process of deploying your own local version of the [Urban Pandemic Preparedness Dashboard](https://urbanresilience.secdev.com/) (referred to as UPPD or ‘the application’).

For your convenience, we have provided a `main` git branch that includes all assets required to run the application for Los Angeles. There is also a `clean` branch that has cleared out all example information for users wishing to deploy their own version of the tool.

You can view a live demo of the Los Angeles dashboard [here](https://urbanresilience.secdev.com/los-angeles)

Below are the full requirements for the index and asset files to be compatible with our deployment package as well as examples and instructions for customizing the tool. Please note that the guide below assumes you have already completed the index calculations in a structure somewhat similar to our own - please see the methodology documents [in this directory](https://github.com/SECDEV-GROUP/urban-preparedness-dashboard/tree/main/uppd-application/src/assets) for details on our index methodology.

If you have any questions about deploying your UPPD with additional customization or require assistance with data integration beyond the scope of this document, please contact the SecDev Group at [secdev@secdev.com](mailto:secdev@secdev.com)

## Prerequisites

- Docker Engine
- Server running Ubuntu or Mac OS with >= 4GB RAM
- Approximately 6 GB of hard drive space
- A [Mapbox API key](https://docs.mapbox.com/help/getting-started/access-tokens/) with default permissions

## Environment

- It’s strongly recommended that you set up npm (via installing [Node.js](https://nodejs.org/en/download/)) to run the application side independently and test small visual or textual changes
- This application was developed and tested in Mac OS and Ubuntu. It may not behave as expected when deployed to a Windows server.

## Structure

There are four main subdirectories, each representing a component of the application. These subdirectories have additional README’s composed by our partners in developing the frontend, RS21.

- `uppd-docker-compose`: Contains docker-compose file for easy deployment of all components. Only potential changes needed involve changing ports depending on your deployment needs.
- `uppd-tile-server`: Contains the code to initalize the tile server for the map - the coloured heatmap tiles and the points of interest are shown by querying this server
- `uppd-database`: Contains the code to initialize all datasets for the map, including importing indices, points of interest, and shapefile from user-added files.
- `uppd-application`: Contains all the front end code. This is the directory that will require the most customization to deploy your own version.

## Data File Requirements

There are three main types of data files, all of which are located in the `uppd-database/docker/data` folder.

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
- Note the name of the label column for use with uppd-application later.
- Files must be .csv files located in uppd-database/docker/data/csv/assets

### Primary Index

- The primary dataset to be visualized - in our demo, this is the UPPD Index Score or Risk Score. It is also referred to as `city_metrics` in the database
- Aside from the points of interest and shapefile, all data that should be included in the dashboard should be in the index files.
- Must be .csv files located in `uppd-database/docker/data/csv/indices`
- The most recent index file should be called `current_indices.csv`
  - Currently, this project does not support automatic data updates. This means that adding additional years of data to V1 of the application will require current_indices to be replaced and the database to be rebuilt
- The most recent index file will be used to create the database table for the indices.
- Any additional index files must have the same column names in the same order as current_indices, or data may be added inaccurately.
- Additional index files should be called `filename_YYYY_indices.csv`, where YYYY is the year of data represented in the indices file
- The database expects a column called `tractce10` to be in current_indices to align with the shapefile.
  - If you have a different column name for the main code or id used for the areas of interest (usually the smallest available unit, such as a census tract, neighborhood, or Lower-layer Super Output Areas (LSOAs)), adjust the name in `uppd-database/src/sql/views/05_view_data.sql` line 4, after the `m.`
- The database expects a column called `source_date` with dates in the format YYYY-MM-DD or MM/DD/YYYY.
- Take note of the columns which have data you will want to display on the front end. Consult the methodology documents in `uppd-application/src/assets` for details about how we organized the column names and calculated the values for our deployments

### Shapefile

- Must be named `city_geography.shp` and be located in `uppd-database/docker/data/shapefile`
- Note the name of the column with the id for the regions to match with the indices. If it is not ‘tractce’, update `uppd-database/src/sql/views/05_view_data.sql` on line 4 and put the column name after `g.`
- If there are special characters in the shapefile that go beyond UTF-8, you may have to modify line 52 of uppd-database/docker/dbscripts/02-load-data.sh to change the character set used for the postgis database

**Example Alteration: uppd-database/src/sql/views/05_view_data.sql**

Default - the location id columns are assumed to be `tractce10` in both the shapefile (city_geography.shp) and the indices files (current_indices.csv). The city_geography id column is changed to tractce using ALTER TABLE on lines 1-2 before creating the view to avoid errors due to the duplicate name

```
    ALTER TABLE city_geography
    RENAME COLUMN tractce10 to tractce;

    CREATE VIEW view_data AS
    SELECT *
    FROM city_metrics AS m, city_geography AS g
    WHERE m.tractce10::TEXT = g.tractce;
```

Example after changing 05_view_data.sql for Amsterdam’s data files - note that the ALTER TABLE rename on lines 1-2 is no longer required since the columns already have two different names

```
    CREATE VIEW view_data AS
    SELECT *
    FROM city_metrics AS m, city_geography AS g
    WHERE m.neighborhood_code::TEXT = g.buurt_code;
```

**Example Alteration: uppd-database/docker/dbscripts/02-load-data.sh, lines 49-53**

Default - no -W flag is given, so the conversion from shapefile to postgis compatible data is done assuming the character setting should be in UTF-8

```
    for f in $(ls /usr/local/data/shapefile/*.shp); do
       echo "  loading shapefile data $f..." 2>&1 | tee -a $logData
       NAME=`echo $f | sed 's:.*/::' | cut -d'.' -f1`
       shp2pgsql -s 4326 -I $f ${SCHEMA}.${NAME} | psql -d ${DB} -U ${POSTGRES_USER} 2>&1 | tee -a $logData | grep -Ev "INSERT 0 1|^$"
    done
```

Example after changing 02-load-data.sh for Amsterdam’s shapefile.

Because special characters are included in the file, the character set is changed to LATIN1 using the -W tag, which allows the shapefile to be successfully converted into postgis compatible data. See [postgis manual section 4.3.2](https://postgis.net/docs/manual-1.3/ch04.html#id435762) for details.

```
    for f in $(ls /usr/local/data/shapefile/*.shp); do
       echo "  loading shapefile data $f..." 2>&1 | tee -a $logData
       NAME=`echo $f | sed 's:.*/::' | cut -d'.' -f1`
       shp2pgsql -s 4326 -W "LATIN1" -I $f ${SCHEMA}.${NAME} | psql -d ${DB} -U ${POSTGRES_USER} 2>&1 | tee -a $logData | grep -Ev "INSERT 0 1|^$"
    done
```

## Front End Application Configuration

`uppd-application/src/configuration` contains three files for customizing the front end of the application.

### 1. Image Configuration

img-config.ts lines 1-25

```
// main logo used at the top left corner
import navLogo from '../assets/appBranding/Seal_of_Los_Angeles.svg';
export const mainLogo = navLogo;

// Background images
import backgroundImageOne from '../assets/img/background-image.jpg';
import backgroundImageTwo from '../assets/img/la-bg2.jpg';
[[...
lines 8-18
...]]
// Background image for the About Page
export const AboutBackgroundImage = backgroundImageOne;
// Background image for the Info Page
export const InfoBackgroundImage = backgroundImageTwo;
```

Image files can be placed in uppd-application/src/assets and be imported in img-config.ts to customize the logo in the top left corner of the application as well as the background images used on the main landing page (`AboutBackgroundImage`) and the info / methodology page (`InfoBackgroundImage`)

### 2. Color Configuration

theme-color-config.ts lines 4 - 67

```
export const mapGradientDark = {
 step6: '#FEE5D9',
 step5: '#FCBBA1',
 step4: '#FC9272',
 step3: '#FB6A4A',
 step2: '#DE2D26',
 step1: '#A50F15',
};

export const mapGradientLight = {
 step6: '#EFF3FF',
 step5: '#C6DBEF',
 step4: '#9ECAE1',
 step3: '#6BAED6',
 step2: '#3182BD',
 step1: '#08519C',
};

export const themeOverrides: Overrides = {
 MuiButton: {
   label: {
     textTransform: 'capitalize',
   },
 },
};

export const darkTheme = createMuiTheme({
 palette: {
   type: 'dark',
   primary: {
     main: mapGradientDark.step1,
     light: mapGradientDark.step2,
   },
   secondary: {
     main: '#FDCDBA',
   },
   background: {
     default: '#1E1E1E',
   },
   warning: {
     main: '#F3F800',
   },
 },
 overrides: themeOverrides,
});

export const lightTheme = createMuiTheme({
 palette: {
   type: 'light',
   primary: {
     main: mapGradientLight.step1,
   },
   secondary: {
     main: '#A5CDE4',
   },
   background: {
     default: '#F3F3F3',
   },
   warning: {
     main: '#DBDB0F',
   },
 },
 overrides: themeOverrides,
});
```

This file allows you to customize the colours used in light and dark mode (`lightTheme` and `darkTheme`), as well as the colours used in the heatmap gradient (`mapGradientLight` and `mapGradientDark`). `step6` of the map gradient is the lightest colour, used to show the highest values of the index (lowest risk) and `step1` is the darkest colour, used to show the lowest values of the index (highest risk). `step1` and `step2` for the light and dark gradients are re-used in the themes for the overall application to provide colour coherence, but any of these values can be changed and replaced with a hex colour code.

### 3. Application Configuration

app-config.ts

The bulk of the front end configuration happens in this file. Please be sure to review app-config carefully before deploying.

**mapAreaConfig** (lines 9-21)
```
    export const mapAreaConfig = {
     zoomLevel: 9,
     mapCenter: [-118.2437, 34.0522], // [longitude, latitude]
     bounds: [
       [-119.24, 33.05], // Southwest Coordinates (bottom left)
       [-117.24, 35.05], // Northeast Coordinates (top right)
     ],
     style: {
       dark: 'mapbox://styles/jharnum/cknsxylu20drd17pbsf07gytm',
       light: 'mapbox://styles/jharnum/cknsy11dh0q3h18ql5qeh7f41',
       satellite: 'mapbox://styles/jharnum/cknsxxxqq0q1j17qohk46xz4l',
     },
    };
```
  * This section allows the user to define the area that should be displayed by the map. `mapCenter` is the longitude and latitude for the central point on the first load of the map. `bounds` indicates the limits of the map using the bottom left and top right points.

  * `style` indicates the Mapbox style to use for the map in each of three ‘modes’ - dark, light, and satellite. You may use the styles provided or [see the Mapbox documentation](https://docs.mapbox.com/api/maps/styles/) for more details on creating your own styles.


**filterScale** (lines 23-27)
```
    export const filterScale = {
     lowBound: 0,
     highBound: 100,
     step: 1,
    };
```

   * This variable allows the user to set the bounds for the main index and main index subcategories. This is what is used to create the filterable ‘scale’ of index results on the main map page. Here it has been set to display 0 to 100 and allow users to step in increments of 1.


**Main Column Variables** (lines 29-31)
```
    export const tractId = 'tractce10';
    export const primaryScore = 'secdev_res_plr';
    export const totalPopCol = 'tot_pop_e';
```
* `tractId` is the name of the column to use for matching the region to its shape in the shapefile.
* `primaryScore` is the name of the column with the overall index score - the main value to be displayed when a tract is selected.
* `totalPopCol` is the name of the column with the total population of a given region


**Years of Data** (lines 33-35 main branch)
```
    export const currentYear = 2019;
    export const availableYears: number[] = [2019, 2018, 2017];
    export const projectedYears: number[] = [];
```
* `currentYear` is the most recent year of data available. We found that data was most rich for 2019 in most cities we have developed for so far.
* `availableYears` is used to create the year slider.
    * If only one year of data is available, put only one year between the brackets. 
      *  You may also wish to remove the `DateSlider` component from the sidebar - see `uppd-application/src/components/sidebar/Sidebar.tsx` in the main branch and comment out `&lt;DateSlider />` on line 207 as well as the `DateSlider` import on line 26. 
* `projectedYears` allows a warning message to be displayed when certain years are selected. This is to allow for data that has been created using predictive analysis of some kind. Any year that is not projected can be assumed to be real data rather than projected or interpolated data.

**mapLayers** (lines 37 - 218)
The mapLayers variable is a list of dictionary (or key: value) items, starting with the main index value (in our case, the Urban Pandemic Preparedness Index).
Below are two key examples of these items:

Line 38-42 - **Main index value**

```
    {
       title: 'Urban Pandemic Preparedness Index',
       colName: 'secdev_res_plr',
       subcategories: [],
     },
```
* Note that no subcategories are listed for the main value - this is because they are listed as separate dictionary items in the rest of the list. `title` is what will be displayed on the dropdown menu and sidebar for this item and `colName` is the column in the index file that contains the data.


Lines 43-55 - **Economic factors**
```
    {
       title: 'Economic Factors',
       colName: 'econ_fctrs_plr',
       subcategories: [
         {
           title: 'Percent living below poverty',
           colName: 'pvrty_pe',
         },
         { title: 'Percent unemployed', colName: 'unemp_pe' },
         { title: 'Income per capita', colName: 'pci_e' },
         { title: 'Percent without a high school diploma', colName: 'nohsdp_plr' },
       ],
     },
```
* Here we have four subcategories or metrics listed in the Economic Factors section. When the ‘Economic Factors’ section is clicked in the sidebar, a section will appear showing the individual metrics in this category. `title` will display on the sidebar as the label for the value in the column defined in `colName`.
* The user can add as many or as few of these dictionary items as they would like to display. Currently, no additional number formatting is available, so it may be useful to state in words if a value is a percentage or not, as shown in the example above.


**radarChartConfig** (lines 220-236)
The radar or spider chart is used to display the main category values relative to one another in order to view which aspects a particular region may be stronger or weaker in than others. These are the categories defined in `mapLayers` that have subcategories.

```
    export const radarChartConfig: RadarChartDataType = {
     enabled: true,
     fields: [
       { title: 'Econ. Factors', colName: 'econ_fctrs_plr' },
       { title: 'Disease Factors', colName: 'chronic_fctrs_plr' },
       { title: 'Demo. Factors', colName: 'demograph_fctrs_plr' },
       { title: 'Social Factors', colName: 'social_fctrs_plr' },
       {
         title: 'Lifestyle Factors',
         colName: 'clncl_fctrs_plr',
       },
       {
         title: 'Digital Prep.',
         colName: 'digital_fctrs_plr',
       },
     ],
    };
```
* Because of the small space available for the radar chart labels, some `title`s have been abbreviated. The `colName`s should match the `colName` used for that subcategory in the `mapLayers` variable discussed above.


**linearCharts** (lines 239-264)
These charts can be used to display the relative numbers of binary groups. In our Los Angeles example, we used Under and Over 65 and Male and Female linear charts. See the Age Distribution chart code below.

```
    export const linearCharts: LinearChartDataType[] = [
     {
       title: 'Age Distribution',
       chartId: 'ageDist',
       data: {
         totalPopulation: totalPopCol,
         secondaryCount: 'age65p_pe',
       },
       labels: {
         left: 'Under 65',
         right: 'Over 65',
       },
```
* `title` is the main label for the chart and `chartId` provides an id for this component.
* `data` contains two data columns: the `totalPopulation` column (defined above in totalPopCol variable) and the secondaryCount, which is currently assumed to be a percentage value. I.e. the column named `age65p_pe` contains the percentage of people over 65 in that region.
* `labels` are used to label each side of the chart. Here, the left will be the ‘primaryCount’ (calculated by the application) - the percentage of people under 65 and the right will be our `secondaryCount` defined above.


**racialDistInfo** (lines 266-291)
This displays the percentage of people in a region belonging to racial or ethnic categories defined in the main indices dataset. As many of these categories can be displayed as needed. Below is an abbreviated example.

```
    export const racialDistInfo: RacialDistDataType[] = [
     {
       title: 'African American',
       colName: 'african_american',
     },
     {
       title: 'White',
       colName: 'white',
     },
```
* The `title` is used to label the value in `colName`, which is assumed to be already in percentage format. 
* A tooltip explaining the origins of the category names and that the values may add to more than 100% is included in `uppd-application/src/components/Sidebar/CensusInfo/RacialDistro.tsx` on line 38 - different regions may define racial and ethnic groups differently, so changes to this tooltip may help the user understand where the groupings are coming from.


**PointsOfInterest** (lines 293-348)
This is where you tell the front end application which points of interest you added to the database. You can have as many or as few as you like.
```
    export const PointsOfInterest: PointsOfInterestType[] = [
     {
       title: 'Hospitals',
       endpoint: 'hospitals_and_medical_centers',
       icon: 'hospital-15',
       nameField: 'name',
     },
     {
       title: 'Libraries',
       endpoint: 'libraries',
       icon: 'library-11',
       nameField: 'name',
     },
```
* `title` is the label to display in the toggle dropdown for points of interest.
* `endpoint` is the name of the csv file you added to the database’s csv asset folder without the `.csv` extension. So in this example, the file with the hospital locations was called `hospitals_and_medical_centers.csv`.
* `icon` is the name of a maki icon - you can find the full icon set [here](https://labs.mapbox.com/maki-icons/) and [here](https://openclipart.org/tag/maki-icons). The number after the dash handles sizing in pixels - so here, the library icon is set to appear smaller than the hospital icon.
* `nameField` is the column name in the original csv file that contains the name of the location you would like to have displayed when that point is selected.

Finally, on line 350 of app-config.ts there is a `sidebarText` variable. If desired, users can add a sentence or two of text here (without formatting) and it will display in the sidebar.



## Local Deployment Checklist

1. Docker is installed and running - [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/ubuntu/)
2. Node.js is installed - [https://nodejs.org/en/](https://nodejs.org/en/)
3. Git clone the repository ((link here))
4. Get Mapbox API key
5. Add Mapbox API key to uppd-application/.env
6. Add Mapbox API key to uppd-tile-server/html/index.html, line 29
7. Edit src/sql/00_db_setup.sql to include secure passwords instead of default value
8. Add changed passwords to uppd-tile-server/.env so it can access uppd-database
9. Verify data files fit the requirements detailed above
   1. Shapefile, city_geography.shp
   2. Asset or point of interest files, .csv
   3. Index files, at least current_indices.csv
10. Add custom images, if desired, to uppd-application/src/assets and ensure they are imported in uppd-application/src/configuration/img-config.ts 5. navLogo sets the branding image in the top left corner 6. backgroundImageOne sets the main landing page or About page background 7. backgroundImageTwo sets the Info / Methodology page background
11. Use google maps or another mapping service to get the `mapCenter` and `bounds` to use in `uppd-application/src/configuration/app-config.ts` (line 12-15) and `uppd-tile-server/html/index.html` (line 34). If using google maps, reverse the order of the numbers - google uses (latitude, longitude) and mapbox uses (longitude, latitude).
12. Populate the values in lines 29 - 46 of 1uppd-application/src/configuration/app-config.ts1 using the column names from your current_indices.csv file. See Front End Application Configuration above for details.
13. Populate the `mapLayers` variable, starting on line 49 of `uppd-application/src/configuration/app-config.ts`. See Front End Application Configuration above for details.
14. Populate the `radarChartConfig` variable, starting on line 206 of `uppd-application/src/configuration/app-config.ts`. The radar chart displays the main sub-categories of the index to show their distribution. Shortened versions of the titles may look better for this chart. See Front End Application Configuration above for details.
15. Populate the `linearCharts` variable starting on line 229 of `uppd-application/src/configuration/app-config.ts`. See Front End Application Configuration above for details.
16. Populate the `racialDistInfo` variable starting on line 256. This is used to show population distribution according to more than two variables, which may add up to more than 100%. See Front End Application Configuration above for details.
17. Populate the `PointsOfInterest` variable starting on line 285. This is used to tell the map about the asset files. See Front End Application Configuration above for details.
18. Run `npm run lint` in uppd-application and follow any warnings or error messages that appear
19. Check docker-compose.yml in uppd-docker-compose to ensure that none of the ports are already in use. If they are, change them only on the left side of the colon (eg. `80:80` may become `81:80` if port 80 is already in use
20. Use the command `docker-compose up --build` to build the entire project. Pay attention to any error messages that may appear, particularly when the database is being initialized
21. If there are database errors, use `ctrl+c` to stop the programs and then use the command `docker system prune` to fully remove the database that was set up. This helps to ensure that old errors won’t crop up again unexpectedly
22. When you have verified everything is working correctly, you can stop (ctrl+c) and restart the program using the command `uppd-docker-compose up --build -d` - this starts it in the background.
23. Verify that the three program components - database, tile server, and application - are running using the command ‘docker ps’
24. Visit `localhost:8080` to view the application on your local server

## Troubleshooting

* Use `uppd-database/data_check.py` to run some preliminary tests on your data files before standing up the application for the first time (please note that this is only a quick script meant for people familiar with coding and will field many changes back to the user)
* Running `npm run start` from the command line in the uppd-application directory will stand up a version of the front end at `localhost:3000`. It can still access the tile server and database as long as they are still running.
    * If you have not done so before, you should run `npm install` first to ensure all appropriate packages are installed.
    * `npm run start` can be used to check changes made to the front end only, such as changes to `app-config.ts`, as it will create a hot-loading instance of the application.
* If the database is built with inaccurate data, remove the image using `docker rm database` and re-build once the data has been corrected
* If changes have been made to different parts of the program, it may be helpful to stop all uppd images and run `docker system prune` to clean them up before rebuilding
* If a production deploy is desired, be sure to
    * Search all directories for `localhost` and change as appropriate
    * Ensure that all database credentials have been changed appropriately.
