import React, { useEffect, useRef, useState } from 'react';
import { Box, Slider } from '@material-ui/core';
import {
  createTheme,
  ThemeProvider,
  useTheme,
} from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import { cloneDeep } from 'lodash';
import { AppState, MapGradientType } from '../../../types';
import { filterScale } from '../../../configuration/app-config';
import { setFilterSlider } from '../../../store/modules/sidebarControlStore';
import Histogram from './Histogram';

interface FilterSliderProps {
  mapGradient: MapGradientType;
}

const FilterSlider: React.FC<FilterSliderProps> = ({ mapGradient }) => {
  const sliderRef = useRef<HTMLSpanElement>(null);
  const dispatch = useDispatch();

  const marks = [
    {
      value: filterScale.lowBound,
      label: filterScale.lowBound,
    },
    {
      value: filterScale.highBound,
      label: filterScale.highBound,
    },
  ];

  function valuetext(value: number) {
    return `${value}°C`;
  }

  const filterSliderValue: [number, number] = useSelector(
    (state: AppState) => state.SidebarControl.filterSlider,
  );

  const sliderReset: number = useSelector(
    (state: AppState) => state.SidebarControl.sliderReset,
  );

  const [value, setValue] = useState<[number, number]>(
    cloneDeep(filterSliderValue),
  );

  const [sliderWidth, setSliderWidth] = useState(315);

  const handleChange = (event: any, newValue: number | number[]) => {
    setValue(newValue as [number, number]);
  };

  const commitChange = (
    event: React.ChangeEvent<{}>,
    newValue: number | number[],
  ) => {
    dispatch(setFilterSlider(newValue as [number, number]));
  };

  useEffect(() => {
    setValue([filterScale.lowBound, filterScale.highBound]);
  }, [sliderReset]);

  useEffect(() => {
    if (sliderRef.current) {
      setSliderWidth(sliderRef.current.clientWidth);
    }
  }, [sliderRef.current?.clientWidth]);

  const theme = useTheme();

  const muiTheme = createTheme({
    overrides: {
      MuiSlider: {
        mark: {
          display: 'none',
        },
        track: {
          opacity: 0.1,
          color: 'white',
          height: '12px',
          transform: 'translate(0, -5px)',
          borderRadius: '6px',
        },
        rail: {
          opacity: 1,
          backgroundImage: `linear-gradient(90deg, ${mapGradient.step1} 0%, ${mapGradient.step2} 18.23%, ${mapGradient.step3} 39.38%, ${mapGradient.step4} 59.23%, ${mapGradient.step5} 79.87%, ${mapGradient.step6} 100%)`,
          borderRadius: '3px',
        },
        thumb: {
          color: theme.palette.primary.main,
        },
        markLabel: {
          color: theme.palette.text.secondary,
        },
        markLabelActive: {
          color: theme.palette.text.primary,
        },
      },
    },
  });

  return (
    <div>
      <h2 className="main-header">Select Filter</h2>
      <Box mx={3}>
        <Histogram mapGradient={mapGradient} sliderWidth={sliderWidth} />
        <ThemeProvider theme={muiTheme}>
          <Slider
            id="FilterSlider"
            ref={sliderRef}
            value={value}
            onChange={handleChange}
            onChangeCommitted={commitChange}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            getAriaValueText={valuetext}
            min={filterScale.lowBound}
            max={filterScale.highBound}
            step={filterScale.step}
            marks={marks}
          />
        </ThemeProvider>
      </Box>
    </div>
  );
};
export default FilterSlider;
