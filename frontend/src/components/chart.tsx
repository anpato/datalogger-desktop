import { FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as ChartTip,
  Brush,
  Legend
} from 'recharts';
import { ChartData } from '../constants';

const Chart: FC<{
  chartData: ChartData;
  selectedKeys: string[];
  strokeSize: number;
  selectedColors: { [key: string]: string };
  axisLabels: { x: string; y: string };
}> = ({ chartData, selectedKeys, strokeSize, selectedColors, axisLabels }) => {
  return (
    <div className="w-full mx-0">
      <ResponsiveContainer className="h-full p-2" width={'100%'} height={900}>
        <LineChart className="border-2 py-2 rounded-lg" data={chartData}>
          {!selectedKeys.length ? <h3>Select options from the right</h3> : null}
          <Brush
            style={{ width: '80%' }}
            className="[&>rect]:stroke-slate-400 [&>rect]:fill-slate-200 dark:[&>rect]:fill-slate-700 "
          />
          <ChartTip />
          {selectedKeys.map((key) => {
            const color =
              selectedColors && selectedColors[key]
                ? { stroke: selectedColors[key] }
                : {};
            return (
              <Line
                strokeWidth={strokeSize}
                type="monotone"
                dataKey={key}
                key={key}
                dot={false}
                {...color}
              />
            );
          })}
          <Legend verticalAlign="top" />
          <YAxis
            dataKey={axisLabels.y}
            hide={!axisLabels.y}
            tick={false}
            label={
              <text
                textAnchor="middle"
                x={0}
                dx={500}
                y={0}
                className="rotate-90"
              >
                {axisLabels.y}
              </text>
            }
            type="number"
            scale="auto"
            domain={['auto', 'auto']}
          />
          <XAxis
            axisLine={false}
            hide={!axisLabels.x}
            tick={false}
            label={axisLabels.x}
            dataKey={axisLabels.x}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
