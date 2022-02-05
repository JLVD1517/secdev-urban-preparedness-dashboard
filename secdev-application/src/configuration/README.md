# Application Configuration

This directory contains the following files that drive what the application displays.

## Application Data Configuration: `app-config.ts`

This file contains the bulk of the data configuration for the application.

### Map Area Config: `mapAreaConfig`

The map area config has this basic structure:

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

This variable sets the column name containing the Census Tract Id. This is being used for identifying the clicked geography and setting the Census Tract info in the sidebar and tooltips.

### Primary Score: `primaryScore`

This variable sets the column name of the overall score. This variable is used to set the value of the outlined box in the side bar.

### Projected Years: `projectedYears`

This variable sets an array of projected years. If the selected year on the map is included in this array, the projection disclaimer will be displayed on the map.


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
