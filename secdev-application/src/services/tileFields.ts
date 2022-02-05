import {
  linearCharts,
  mapLayers,
  racialDistInfo,
  radarChartConfig,
  tractId,
} from '../configuration/app-config';

export const tileFields = () => {
  const array: string[] = [];

  // push the tract id
  array.push(encodeURIComponent(tractId));

  // push each map layer category and its subcategories
  mapLayers.forEach(category => {
    array.push(encodeURIComponent(category.colName));
    category.subcategories.forEach(subcategory => {
      array.push(encodeURIComponent(subcategory.colName));
      if (subcategory.percentColName) {
        array.push(encodeURIComponent(subcategory.percentColName));
      }
    });
  });

  // push fields for radar chart
  if (radarChartConfig.enabled) {
    radarChartConfig.fields.forEach(field => {
      array.push(encodeURIComponent(field.colName));
    });
  }

  // push fields for linear charts
  linearCharts.forEach(item => {
    array.push(encodeURIComponent(item.data.secondaryCount));
    array.push(encodeURIComponent(item.data.totalPopulation));
  });

  // push fields for racial distribution charts
  racialDistInfo.forEach(item => {
    array.push(encodeURIComponent(item.colName));
  });

  // return unique
  return [...new Set(array)];
};
