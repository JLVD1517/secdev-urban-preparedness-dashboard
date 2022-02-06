# Application Configuration

This directory contains the following files that drive what the application displays.

## Application Data Configuration: `app-config.ts`

This file contains the bulk of the data configuration for the application.

### Map Area Config: `mapAreaConfig`

The groups map area config has this basic structure: 

```
 {
  zoomLevel: number,
  mapCenter: [number, number], // [longitude, latitude]
  bounds: [
    [number, number], // Southwest Coordinates
    [number, number], // Northeast Coordinates
  ],
  style: {
    dark: string,
    light: string,
    satellite: string,
  },
};
```

### Events Map Area Config: `eventMapAreaConfig`
The events map area config has this basic structure:

```
{
  zoomLevel: number,
  mapCenter: [number, number], // [longitude, latitude]
  bounds: [
    [number, number], // Southwest Coordinates
    [number, number], // Northeast Coordinates
  ],
  style: {
    dark: string,
    light: string,
    satellite: string,
  },
};
```

#### Object Definitions:

1. `zoomlevel`: starting map zoom level with a range of 0 - 22.
2. `mapCenter`: the starting map center point. This should be set to the geographic center of the subject area.
3. `bounds`: the bounding box of the map and the mapBox geocoder. The map cannot be zoomed or panned past this general bounding box. In setting up these coordinates, a good starting point is to subtract one degree to each of the Southwest coordinates and add one degree to each of the Northeast coordinates.
4. `style`: set a style url for light, dark and satellite versions of the map. For more information on style urls see this [MapBox documentation.](https://docs.mapbox.com/help/glossary/style-url/)

### Filter Scale: `filterScale`

The filter scale is where the scale of the the data is set. For example: _0 to 1_ or _0 to 100_. Changing these values affects how the colors are represented on the map, the upper and lower values in the Map Legend, and the upper and lower bounds of slider filter in the sidebar.

The general structure of the `filterScale` is as follows:

```
{
  lowBound: number,
  highBound: number,
  step: number
}
```

#### Object Definitions:

1. `lowBound`: this is the bound for the lowest possible value in the dataset. This will usually be `0`.
2. `highBound`: this is the bound for the highest possible value in the dataset. If your scale is 0 to 1 enter `1` here. If your scale is 0 to 100 enter `100` here.
3. `step`: this value determines the granularity of the slider filter value.

### Tract Id: `tractId`

This variable sets the column name containing the count of groups. This is being used for identifying the clicked geography and setting the context info in the sidebar and tooltips.

### Primary Score: `primaryScore`

This variable sets the column name of the overall count of groups. This variable is used to set the value of the outlined box in the side bar displaying group details.

### Primary Score: `eventsPrimaryScore`

This variable sets the column name of the overall count of events. This variable is used to set the value of the outlined box in the container to filter the articles list.

## Image Configuration: `img-config.ts`

This file contains configuration variables for the following:

1. Navbar Logo
2. Info page branding for light and dark theme.
3. About Page background image.
4. Info Page Background Image.

## Theme Color Configuration: `theme-color-config.ts`

There are several places in this file where you can adjust the colors of the theme.

### Map Gradients: `mapGradientDark` and `mapGradientLight`

The choropleth map is colored based off of six steps. `step1` is the lightest color and corresponds to the lowest score. `step6` is the darkest color and corresponds to the highest score. It is recommended that you align the darkest color in your choropleth map.

### Theme Overrides: `themeOverrides`

In this variable you can set the global overrides for various MUI components. For more information see the [MUI Documentation on Overriding Global Variables.](https://material-ui.com/customization/globals/#css)

## Dark Theme and Light Theme: `darkTheme` and `lightTheme`

This application is built using the MUI palette system. For more information on the default colors in the MUI palette see the [MUI Palette documentation.](https://material-ui.com/customization/palette/)

Each variable (`darkTheme` or `lightTheme`) contains an object with a key named `palette:`. Inside of the palette object you can override the colors of the default MUI palette. Removing color variables from the palette object will revert the colors to the original MUI palette color described in the documentation described above. You may override as many or as few of the default colors as desired.

**NOTE:** The `type:` key inside of the palette object must **not** be changed.

## Theme Specific Override Extensions: `darkTheme.overrides` and `lightTheme.overrides`

These two override extensions include global css overrides specifically for the MapBox Geocoder component corresponding to the light and dark themes. These overrides reference the theme colors of each customized palette and should not need to be modified in most instances.


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

Image files can be placed in secdev-application/src/assets and be imported in img-config.ts to customize the logo in the top left corner of the application as well as the background images used on the main landing page (`AboutBackgroundImage`) and the info / methodology page (`InfoBackgroundImage`)

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