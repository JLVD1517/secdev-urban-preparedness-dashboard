import React from 'react';
import Plot from 'react-plotly.js';
import { useSelector } from 'react-redux';
import { useTheme } from '@material-ui/core';
import { AppState, SelectedItemType } from '../../../types';
import { filterScale } from '../../../configuration/app-config';

interface RadarChartProps {
  chartFields: { title: string; colName: string }[];
  selectedItem: SelectedItemType;
}

const RadarChart: React.FC<RadarChartProps> = ({
  chartFields,
  selectedItem,
}) => {
  const selectedPrecinct: SelectedItemType | null = useSelector(
    (state: AppState) => state.SidebarControl.selectedItem,
  );
  const theme = useTheme();

  const layout = {
    polar: {
      radialaxis: {
        visible: true,
        range: [filterScale.lowBound, filterScale.highBound],
      },
      bgcolor: 'rgba(0,0,0,0',
    },
    font: {
      color: theme.palette.text.primary,
      size: 10,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    width: 350,
    height: 400,
  };

  const getTitles = () => {
    const array: string[] = [];
    chartFields.forEach(item => {
      array.push(item.title);
    });
    return array;
  };

  const getValues = () => {
    const array: number[] = [];
    chartFields.forEach(item => {
      array.push(parseFloat(selectedItem[item.colName]));
    });
    return array;
  };

  return (
    <>
      {selectedPrecinct && (
        <Plot
          data={[
            {
              type: 'scatterpolar',
              r: getValues(),
              theta: getTitles(),
              fill: 'tonext',
              fillcolor: theme.palette.primary.main,
              opacity: 0.9,
              line: {
                color: theme.palette.primary.main,
              },
            },
          ]}
          layout={layout}
          config={{ displayModeBar: false }}
          className="radar-chart"
        />
      )}
    </>
  );
};

export default RadarChart;
