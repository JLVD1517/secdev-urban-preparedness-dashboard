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

### MapLayers: `mapLayers`

The mapLayers array is an array of objects that drive the available choropleth layers that can be shown on the map, as well as the list of expandable cards at the bottom of the sidebar.

The basic structure of one of the mapLayer objects is as follows:

```
{
    title: string,
    colName: string
    subcategories: [
      { title: string,
       colName: string,
       percentColName: string, // optional
      },
    ],
  },
```

#### Object Definitions:

1. `title`: The display name for the object.
2. `colName`: Column Name for the object referenced from the csv data (\*_Note:_ this field should have a value between 0 and 1)
3. `subcategories`: An array of subcategory fields corresponding to the parent object.

- `title`: The display name for the object.
- `colName`: Column Name for the object referenced from the csv data
- `percentColName`: An optional key in the subcategory object. Add this field to show the percentage value on one of the census detail items.
- **Note:** If there are no subcategories leave the array empty: (`subcategories: []`).

**MapLayers array guidance:**

1. The most general category should be assigned the first position in the array. This is generally the same `colName` as assigned to the `primaryScore` mentioned above.
2. If a mapLayer does not include any subCategories, it will not be assigned an expandable card in the sidebar.

### Radar Chart Configuration: `radarChartConfig`:

The radar chart config has the following structure:

```
{
  enabled: boolean,
  fields: [
    {title: string, colName: string}
  ]
}
```

#### Object Definitions:

1. `enabled`: boolean field. Set to false if you want to completely hide the radar chart
2. `fields`: an array of objects with a string and title. The `title` references the item name on the radar chart, and `colName` references the column name from the original csv associated with that field.(**Note:** the values represented in the `colName` key should have values between 0 and 1.)

### Linear Charts: `leanearCharts`:

This variable is an array of objects with the following structure:

```
  {
    title: 'string',
    chartId: 'string',
    data: {
      totalPopulation: 'string',
      secondaryCount: 'string',
    },
    labels: {
      left: 'string',
      right: 'string',
    },
  },
```

#### Object definitions:

`title`: displayed title of the chart
`chartId`: an assigned id for the chart. Each id should be unique among all entries in the array.
`data`: {
`totalPopulation`: this field should reference the column name containing the total population of the selected area.
`secondaryCount`: this field should reference column name of total count of the subject of the chart. (example count of individuals over age 65)
}
`labels`: {
`left`: the category label for the left side of the chart.
`right`: the category label for the right side of the chart.
}

### Racial Distribution Information: `racialDistInfo`:

This is an array of objects with the general structure of:

```
{title: string, colName: string}
```

Adding an object with a column name will add that info to the sidebar. **NOTE:** It is intended for the data associated with `colName` in this instance to be formatted as a number between 0 and 100.

### Points of Interest: `pointsOfInterest`:

The `PointsOfInterest` array is an array of objects that drive the available point layers within the Points of Interest dropdown.

The basic structure of the `PointsOfInterest` objects is as follows:

```ts
{
    title: string,
    endPoint: string,
    icon: string,
    nameField: string,
}
```

#### Object Definitions:

1. `title`: The display name for the object. Also used as a key in the react store values.
2. `endPoint`: The end point variable to retrieve the layer. Should be the name of the layer data located in the asset directory of the database.
3. `icon`: The name of the MapBox icon to be displayed.
4. `nameField`: The column containing the text to be displayed inside the asset popup.

#### Adding New Icons

New icons will require uploading an svg asset to the MapBox studio style being used.

1. Navigate to [https://studio.mapbox.com](https://studio.mapbox.com) and select the style you want to add the icon to.
2. In the MapBox studio style editor click `Images` in the top toolbar.
3. Click the `Custom` tab in the images menu.
4. Click `Upload Images` and select the svg files you would like to upload.
5. Once uploaded you can hover over the icon to confirm the name of the new icon.
6. Once you are done adding new images make sure to click publish in the top right of the editor toolbar.

### Sidebar Text: `sidebarText`:

This variable sets the paragraph of text below the layer selection dropdown in the sidebar.

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
