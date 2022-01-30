import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  LineChart,
  Line
} from 'recharts';
import { useTheme, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {  MapGradientType, plotData } from '../../types';

interface AreaChartProps {
  darkTheme: boolean;
  mapGradient: MapGradientType;
  data: plotData[]
}

// const data = [
//   {
//     name: 'Page A',
//     uv: 4000,
//     pv: 2400,
//     amt: 2400,
//   },
//   {
//     name: 'Page B',
//     uv: 3000,
//     pv: 1398,
//     amt: 2210,
//   },
//   {
//     name: 'Page C',
//     uv: 2000,
//     pv: 9800,
//     amt: 2290,
//   },
//   {
//     name: 'Page D',
//     uv: 2780,
//     pv: 3908,
//     amt: 2000,
//   },
//   {
//     name: 'Page E',
//     uv: 1890,
//     pv: 4800,
//     amt: 2181,
//   },
//   {
//     name: 'Page F',
//     uv: 2390,
//     pv: 3800,
//     amt: 2500,
//   },
//   {
//     name: 'Page G',
//     uv: 3490,
//     pv: 4300,
//     amt: 2100,
//   },
// ];

const AreaChartData: React.FC<AreaChartProps> = ({ darkTheme, mapGradient, data}) => {
  const theme = useTheme();
  const useStyles = makeStyles((theme: Theme) => ({
    root: {
      position: 'relative',
    },
  }));

  const classes = useStyles();
  return (
    <LineChart
      width={400}
      height={280}
      data={data}
      margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
    >
      <defs>
        <linearGradient id="events-plot" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={mapGradient.step1} stopOpacity={1} />
          <stop offset="32%" stopColor={mapGradient.step2} stopOpacity={1} />
          <stop offset="48%" stopColor={mapGradient.step3} stopOpacity={1} />
          <stop offset="64%" stopColor={mapGradient.step4} stopOpacity={1} />
          <stop offset="80%" stopColor={mapGradient.step5} stopOpacity={1} />
          <stop offset="96%" stopColor={mapGradient.step6} stopOpacity={1} />
        </linearGradient>
      </defs>
      <XAxis dataKey="date">
          <Label value="Pages of my website" offset={0} position="insideBottom" />
      </XAxis>
      <YAxis label={{ value: 'Number of Articles', angle: -90, position: 'center' }}/>
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="value"
        stroke="url(#events-plot)"
        fillOpacity={1}
        fill="url(#events-plot)"
        dot={false}
      />
    </LineChart>
  );
};

export default AreaChartData;
