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
import {  PlotData } from '../../types';
import { EventypePlotdata } from '../../types/modules/eventsPlots.type';

interface AreaChartProps {
  darkTheme: boolean;
  data: EventypePlotdata[] | []
}
const colours = ["#FFFF00", "#008000	", "#FF00FF", "#800080", "#800000", "#8884d8", "#82ca9d", "#d2691e", "#8b008b", "#483d8b", "#2f4f4f", "#ffa07a", "#ba55d3", "#6a5acd", "#4682b4", "#40e0d0", "#ee82ee", "#000080", "#FFFF00", "#008000	", "#FF00FF", "#800080", "#800000", "#8884d8", "#000080"];

const MultiLineChartData: React.FC<AreaChartProps> = ({ darkTheme, data}) => {
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
      width={400}
      height={250}
      data={data}
      margin={{ top: 20, right: 30, left: 20, bottom: 12 }}
    >
      <XAxis dataKey="date">
          <Label value="Pages of my website" stroke={darkTheme ? "#fff" : "#000"} offset={0} position="insideBottom" />
      </XAxis>
      <YAxis label={{ value: 'Number of Articles',stroke:darkTheme ? "#fff" : "#000", angle: -90, position: 'center' }}/>
      <Legend />
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
