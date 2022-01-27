import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar/Sidebar';
import Map from './Map/Map';
import MapLegend from './MapLegend/MapLegend';
import MapLoading from './Map/MapLoading';
import MapAttribution from './Map/MapAttribution';
import {
  mapGradientLight,
  mapGradientDark,
} from '../configuration/theme-color-config';
import { AppState } from '../types';

const Groups: React.FC = () => {
  const [dimensions, setDimensions] = useState({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  });

  const [currentMapGradient, setMapGradient] = useState(mapGradientDark);

  useEffect(() => {
    function handleResize(): void {
      setDimensions({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
  }, []);

  const darkTheme: boolean = useSelector(
    (state: AppState) => state.AppControl.darkTheme,
  );
  const selectedYear: number | number[] = useSelector(
    (state: AppState) => state.SidebarControl.selectedYear,
  );
  const selectedMonth: number | number[] = useSelector(
    (state: AppState) => state.SidebarControl.selectedMonth,
  );

  const availableYears: number[] = useSelector(
    (state: AppState) => state.AvailableYears.availableYears,
  );

  const availableYearsLoaded: boolean = useSelector(
    (state: AppState) => state.AvailableYears.loaded,
  );

  useEffect(() => {
    setMapGradient(darkTheme ? mapGradientDark : mapGradientLight);
  }, [darkTheme]);

  // return TSX and pass our state as props to the other components
  return (
    <>
      {availableYearsLoaded && availableYears.length > 0 ? (
        <div>
          <Map
            darkTheme={darkTheme}
            selectedYear={selectedYear}
            selectedMonth = {selectedMonth}
            mapGradient={currentMapGradient}
          />
          <Sidebar mapGradient={currentMapGradient} />
          <MapAttribution />
        </div>
      ) : (
        <MapLoading />
      )}
    </>
  );
};
export default Groups;
