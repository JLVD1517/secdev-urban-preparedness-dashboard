import React from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  Label,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { useTheme, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {  MapGradientType, PlotData } from '../../types';
import { EventypePlotdata } from '../../types/modules/eventsPlots.type';

interface AreaChartProps {
  darkTheme: boolean;
  data: EventypePlotdata[] | [],
  mapGradient: MapGradientType;
}

const colours = ["#008000	", "#FF00FF", "#800080", "#800000", "#8884d8", "#82ca9d", "#d2691e", "#8b008b", "#483d8b", "#2f4f4f", "#ffa07a", "#ba55d3", "#6a5acd", "#4682b4", "#40e0d0", "#ee82ee", "#000080", "#FFFF00", "#008000	", "#FF00FF", "#800080", "#800000", "#8884d8", "#000080"];

const MultiLineChartData: React.FC<AreaChartProps> = ({ mapGradient, darkTheme, data}) => {
  
  const theme = useTheme();
  const useStyles = makeStyles((theme: Theme) => ({
    root: {
      position: 'relative',
    },
  }));

  let firstObj = null;
  if(data.length) {
    firstObj = {...data[0]}
    delete firstObj.date;
  }

  const classes = useStyles();
  
  return (
    <LineChart
      width={500}
      height={270}
      data={data}
      margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
    >
      <XAxis dataKey="date">
          {/* <Label value="Pages of my website" stroke={darkTheme ? "#fff" : "#000"} offset={-12} position="insideBottom" /> */}
      </XAxis>
      <YAxis label={{ value: 'Number of Articles',stroke:darkTheme ? "#fff" : "#000", angle: -90, position: 'center', dx: -25}}/>
      <Tooltip filterNull={true} />
      <Legend verticalAlign="top" layout='vertical' align='right' height={35}/>
      {firstObj && Object.keys(firstObj).map( (key, index) => {
        return <Line
                type="monotone"
                dataKey={key}
                stroke={colours[index]}
                fill={colours[index]}
                dot={false}
              />
        })
      }
  </LineChart>
  );
};

export default MultiLineChartData;
