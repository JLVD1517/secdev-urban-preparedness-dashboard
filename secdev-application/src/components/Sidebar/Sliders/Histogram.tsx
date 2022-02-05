import React, { useEffect } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { fetchColumnData } from '../../../store/modules/histogramDataStore';
import { AppState, MapGradientType } from '../../../types';

interface HistogramProps {
  mapGradient: MapGradientType;
  sliderWidth: number;
}

const useStyles = makeStyles({
  root: {
    marginBottom: '-15px',
  },
});

const Histogram: React.FC<HistogramProps> = ({ mapGradient, sliderWidth }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const classes = useStyles();

  const selectedYear = useSelector(
    (state: AppState) => state.SidebarControl.selectedYear,
  );

  const selectedLayerId: string = useSelector(
    (state: AppState) => state.SidebarControl.selectedLayerId,
  );

  const columnData = useSelector(
    (state: AppState) => state.HistogramData.columnData,
  );

  useEffect(
    () => {
      dispatch(fetchColumnData(`${selectedLayerId}/${selectedYear}`));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLayerId, selectedYear],
  );

  return (
    <Plot
      className={classes.root}
      data={[
        {
          x: columnData,
          type: 'histogram',
          // @ts-ignore
          nbinsx: 6,
          marker: {
            color: [
              mapGradient.step1,
              mapGradient.step2,
              mapGradient.step3,
              mapGradient.step4,
              mapGradient.step5,
              mapGradient.step6,
            ],
          },
        },
      ]}
      layout={{
        width: sliderWidth,
        height: 100,
        hovermode: false,
        margin: {
          l: 0,
          t: 0,
          b: 0,
          r: 0,
        },
        xaxis: {
          fixedrange: true,
        },
        yaxis: {
          fixedrange: true,
          showgrid: false,
        },
        font: {
          color: theme.palette.text.primary,
          size: 10,
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
      }}
      config={{ displayModeBar: false }}
    />
  );
};

export default Histogram;
