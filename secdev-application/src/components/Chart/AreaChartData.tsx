import React from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  Label,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useTheme, Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { MapGradientType, PlotData } from "../../types";
import "./tooltip.scss";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <ul className="custom-tooltip custom-tooltip-list">
        <p className="intro">{label}</p>
        {payload.map(({ value, name, color }: any) => {
            return (
              <li className={"custom-tooltip-item"}>
                <h5 className={"custom-tooltip-item-title"}>
                  <span
                    className={"custom-tooltip-item-icon"}
                    style={{ backgroundColor: color }}
                  />
                  <span className={"custom-tooltip-item-text"}>{name}: </span> 
                  <span className={"custom-tooltip-item-text"}> {typeof value === "number"
                    ? value.toFixed(1)
                    : (0).toFixed(1)} </span>
                </h5>
              </li>
            );
          })}
      </ul>
    );
  }

  return null;
};

interface AreaChartProps {
  darkTheme: boolean;
  mapGradient: MapGradientType;
  data: PlotData[] | [];
}

const AreaChartData: React.FC<AreaChartProps> = ({
  darkTheme,
  mapGradient,
  data,
}) => {
  const theme = useTheme();
  const useStyles = makeStyles((theme: Theme) => ({
    root: {
      position: "relative",
    },
  }));

  const classes = useStyles();

  return (
    <LineChart
      width={400}
      height={270}
      data={data}
      margin={{ top: 20, right: 30, left: 40, bottom: 30 }}
    >
      <defs>
        <linearGradient id="events-plot" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="32%" stopColor={mapGradient.step2} stopOpacity={1} />
          <stop offset="48%" stopColor={mapGradient.step3} stopOpacity={1} />
          <stop offset="64%" stopColor={mapGradient.step4} stopOpacity={1} />
          <stop offset="80%" stopColor={mapGradient.step5} stopOpacity={1} />
          <stop offset="96%" stopColor={mapGradient.step6} stopOpacity={1} />
        </linearGradient>
      </defs>
      <XAxis dataKey="date" stroke={darkTheme ? "#fff" : "#000"} fontSize={10}>
        {/* <Label value="Pages of my website" stroke={darkTheme ? "#fff" : "#000"} offset={-12} position="insideBottom" /> */}
      </XAxis>
      <YAxis
        label={{
          value: "Avg Tone of Events",
          stroke: darkTheme ? "#fff" : "#000",
          angle: -90,
          position: "center",
          dx: -20,
        }}
        stroke={darkTheme ? "#fff" : "#000"}
        fontSize={10}
      />
      <Tooltip 
        filterNull={true}
        contentStyle={{ color: "#000" }}
        cursor={{ stroke: "rgba(230, 234, 238, 0.6)", strokeWidth: 3 }}
        isAnimationActive={false}
        offset={40}
        content={<CustomTooltip />} />
      {/* <Legend /> */}
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
