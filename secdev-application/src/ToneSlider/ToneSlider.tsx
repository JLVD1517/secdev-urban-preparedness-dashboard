import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Slider } from '@material-ui/core';
import { createTheme, ThemeProvider, useTheme } from '@material-ui/core/styles';

interface MarksType {
  value: number;
  label: number;
}

const ToneSlider: React.FC = () => {
  const [value, setValue] = React.useState<number | number[]>();
  const [marks, setMarks] = React.useState<MarksType[]>([
    {
      value: 0,
      label: 0,
    },
    {
      value: 50,
      label: 50,
    },
    {
      value: 100,
      label: 100,
    },
  ]);

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
    //call apis
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
    <div style={{ width: '18vw' }}>
      <Box>
        <ThemeProvider theme={muiTheme}>
          <Slider
            style={{ marginBottom: '-32px' }}
            id="DateSlider"
            value={value}
            track={false}
            getAriaValueText={valuetext}
            onChange={handleChange}
            onChangeCommitted={commitChange}
            aria-labelledby="discrete-slider-custom"
            step={1}
            max={100}
            min={0}
            valueLabelDisplay="auto"
            marks={marks}
          />
        </ThemeProvider>
      </Box>
    </div>
  );
};
export default ToneSlider;
