import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Slider } from '@material-ui/core';
import {
  createTheme,
  ThemeProvider,
  useTheme,
} from '@material-ui/core/styles';
import { setSelectedMonth } from '../../../store/modules/sidebarControlStore';
import { AppState } from '../../../types';
import { availableMonths } from '../../../configuration/app-config';

interface MarksType {
  value: number;
  label: number;
}

const DateSlider: React.FC = () => {
  const dispatch = useDispatch();

  const selectedMonth: number | number[] = useSelector(
    (state: AppState) => state.SidebarControl.selectedMonth,
  );

  const [value, setValue] = React.useState<number | number[]>(selectedMonth);
  const [marks, setMarks] = React.useState<MarksType[]>([]);

  useEffect(
    () => {
      const lastMonth = availableMonths[availableMonths.length - 1].value;
      const newMarks: MarksType[] = [];

      // set the slider and store value to the last available date
      setValue(lastMonth);
      dispatch(setSelectedMonth(lastMonth));

      // set the marks in state
      setMarks(availableMonths);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableMonths],
  );

  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: number | number[],
  ) => {
    setValue(newValue);
  };

  const commitChange = (
    event: React.ChangeEvent<{}>,
    newValue: number | number[],
  ) => {
    dispatch(setSelectedMonth(newValue));
  };

  function valuetext(value: number) {
    return `${value}`;
  }
  const theme = useTheme();

  const muiTheme = createTheme({
    overrides: {
      MuiSlider: {
        mark: {
          display: 'none',
        },
        track: {
          color: theme.palette.primary.main,
        },
        rail: {
          color: theme.palette.primary.main,
        },
        thumb: {
          color: theme.palette.primary.main,
        },
        markLabel: {
          color: theme.palette.text.secondary,
          marginTop: '-40px',
        },
        markLabelActive: {
          color: theme.palette.text.primary,
        },
      },
    },
  });

  return (
    <div>
      <h2 className="main-header">Select Month</h2>
      <Box px={3} mb={-3} mt={4}>
        <ThemeProvider theme={muiTheme}>
          {availableMonths.length > 0 && (
            <Slider
              id="DateSlider"
              value={value}
              track={false}
              getAriaValueText={valuetext}
              onChange={handleChange}
              onChangeCommitted={commitChange}
              aria-labelledby="discrete-slider-custom"
              step={1}
              max={availableMonths[availableMonths.length - 1].value}
              min={availableMonths[0].value}
              valueLabelDisplay="auto"
              marks={availableMonths}
            />
          )}
        </ThemeProvider>
      </Box>
    </div>
  );
};
export default DateSlider;
