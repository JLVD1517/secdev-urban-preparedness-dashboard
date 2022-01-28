import {
  LinearChartDataType,
  MapLayerDataConfigType,
  RacialDistDataType,
  RadarChartDataType,
} from '../types';

export const mapAreaConfig = {
  zoomLevel: 10,
  mapCenter: [-72.294076, 18.576421], // [longitude, latitude]
  bounds: [
    [-73.036426, 18.105569], // Southwest Coordinates (bottom left)
    [-71.481405, 19.479333], // Northeast Coordinates (top right)
  ],
  style: {
    dark: 'mapbox://styles/jharnum/cknsxylu20drd17pbsf07gytm',
    light: 'mapbox://styles/jharnum/cknsy11dh0q3h18ql5qeh7f41',
    satellite: 'mapbox://styles/jharnum/cknsxxxqq0q1j17qohk46xz4l',
  },
};

export const filterScale = {
  lowBound: 0,
  highBound: 20,
  step: 1,
};

export const tractId = 'gid';
export const primaryScore = 'no_of_groups';
export const totalPopCol = 'gid';

export const currentYear = 2021;
export const currentMonth = 12;
export const availableYears: number[] = [2022, 2021];
export const availableMonths: any[] = [
  {label: "JAN", value: 1},
  {label: "MAR", value: 3},
  {label: "MAY", value: 5},
  {label: "JUL", value: 7},
  {label: "SEP", value: 9},
  {label: "DEC", value: 12},
];
export const projectedYears: number[] = [];

export const mapLayers: MapLayerDataConfigType[] = [
  {
    title: 'Urban Pandemic Preparedness Index',
    colName: 'gid',
    subcategories: [],
  },
];

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

// note line charts are based off of total population counts and not index score
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
  },
  {
    title: 'Gender Distribution',
    chartId: 'genderDist',
    data: {
      totalPopulation: totalPopCol,
      secondaryCount: 'pop_ml_e',
    },
    labels: {
      left: 'Female',
      right: 'Male',
    },
  },
];

export const racialDistInfo: RacialDistDataType[] = [
  {
    title: 'African American',
    colName: 'african_american',
  },
  {
    title: 'White',
    colName: 'white',
  },
  {
    title: 'Asian',
    colName: 'asian',
  },
  {
    title: 'Hispanic or Latino',
    colName: 'hispanic_latino',
  },
  {
    title: 'American Indian or Alaska Native',
    colName: 'american_indian_alaska_native',
  },
  {
    title: 'Native Hawaiian or Other Pacific Islander',
    colName: 'native_hawaiian_other_pacific_islander',
  },
];

export const sidebarText = '';
