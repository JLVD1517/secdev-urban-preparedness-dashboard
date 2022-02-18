import {
  LinearChartDataType,
  MapLayerDataConfigType,
  RacialDistDataType,
  RadarChartDataType,
  PointsOfInterestType
} from '../types';

export const mapAreaConfig = {
  zoomLevel: 9.5,
  mapCenter: [-72.00294531498565, 18.574675948874585], // [longitude, latitude]
  bounds: [
    [-72.69657698048049, 18.233846728442785], // Southwest Coordinates (bottom left)
    [-71.30931364949113, 18.91482521433265], // Northeast Coordinates (top right)
  ],
  style: {
    dark: 'mapbox://styles/jharnum/cknsxylu20drd17pbsf07gytm',
    light: 'mapbox://styles/jharnum/cknsy11dh0q3h18ql5qeh7f41',
    satellite: 'mapbox://styles/jharnum/cknsxxxqq0q1j17qohk46xz4l',
  },
};

export const eventMapAreaConfig = {
  zoomLevel: 8.7,
  mapCenter: [-72.1926245536074, 18.60524685607544], // [longitude, latitude]
  bounds: [
    [-72.79784011849411, 18.225258092760527], // Southwest Coordinates (bottom left)
    [-71.58740898872112, 18.98438914590291], // Northeast Coordinates (top right)
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

export const LANGUAGE = {
  ENGLISH: 'english',
  FRENCH: 'french'
}

export const tractId = 'gid';
export const primaryScore = 'no_of_groups';
export const totalPopCol = 'gid';
export const avgTone = 'avg_tone';
export const eventsPrimaryScore = 'no_of_articles';
export const subCommuneNameKey = 'adm2_en';
export const communeNameKey = 'adm3_en'

export const currentYear = 2021;
export const currentMonth = 12;
export const availableYears: number[] = [2022, 2021];
export const availableMonths: any[] = [
  {label: "JAN", value: 1},
  {label: "APR", value: 4},
  {label: "JUL", value: 7},
  {label: "OCT", value: 10},
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

export const PointsOfInterest: PointsOfInterestType[] = [
  {
    title: 'Health Sites',
    endpoint: 'healthsites',
    icon: 'hospital-15',
    nameField: 'name',
  },
  {
    title: 'Settlements As Points',
    endpoint: 'settlements_as_points',
    icon: 'stadium-15',
    nameField: 'name',
  },
];

export const sidebarText = '';
