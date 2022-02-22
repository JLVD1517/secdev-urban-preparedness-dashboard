import {
  MapGradientType,
  PointsOfInterestStoreType,
  PointsOfInterestType,
} from '../types';

import { filterScale } from '../configuration/app-config';

export const scaleSteps = () => {
  const step = (filterScale.highBound - filterScale.lowBound) / 5;
  return {
    step1: filterScale.lowBound,
    step2: filterScale.lowBound + step,
    step3: filterScale.lowBound + 2 * step,
    step4: filterScale.lowBound + 3 * step,
    step5: filterScale.lowBound + 4 * step,
    step6: filterScale.highBound,
  };
};

export const getColor = (score: number, mapGradient: MapGradientType) => {
  return score === scaleSteps().step1
    ? mapGradient.step1
    : score < scaleSteps().step2
    ? mapGradient.step2
    : score < scaleSteps().step3
    ? mapGradient.step3
    : score < scaleSteps().step4
    ? mapGradient.step4
    : score < scaleSteps().step5
    ? mapGradient.step5
    : mapGradient.step6;
};

export const getRating = (score: number) => {
  /** this determines the language for risk assessment that appears in the tooltip and on the sidebar
  // lower score = higher risk
  // if the word 'risk' needs to be changed in the popup, see /src/components/Map/MapToolTip/PopupContents/PopupContent.tsx
  // if the word 'risk' needs to be changed on the sidebar, see /src/components/Sidebar/CensusInfo/RiskIndex.tsx
  */
  if (score < 30) {
    return 'High';
  }
  if (score < 70) {
    return 'Medium';
  }
  return 'Low';
};

export const formatDisplayNumber = (value: string, decPlaces?: number) => {
  // how many decimal places should be displayed?
  if (decPlaces) {
    return parseFloat(value).toFixed(decPlaces);
  }
  return parseFloat(value).toFixed(1);
};

export const groupPOI = (items: PointsOfInterestType[]) => {
  const assets: PointsOfInterestStoreType = {};
  items.forEach((item: PointsOfInterestType) => {
    assets[item.title] = {
      selected: false,
    };
  });
  return assets;
};
