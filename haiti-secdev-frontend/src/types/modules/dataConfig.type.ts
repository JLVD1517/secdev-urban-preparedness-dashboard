export interface CategoryType {
  title: string;
  colName: string;
  percentColName?: string;
}

export interface MapLayerDataConfigType {
  title: string;
  colName: string;
  subcategories: CategoryType[];
}

export interface RacialDistDataType {
  title: string;
  colName: string;
}

export interface LinearChartDataType {
  title: string;
  chartId: string;
  data: {
    totalPopulation: string;
    secondaryCount: string;
  };
  labels: {
    left: string;
    right: string;
  };
}

export interface RadarChartDataType {
  enabled: boolean;
  fields: CategoryType[];
}
