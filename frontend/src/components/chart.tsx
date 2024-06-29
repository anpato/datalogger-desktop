import { FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as ChartTip,
  Brush,
  Legend,
  LegendProps,
  Label
} from 'recharts';
import { ChartData } from '../constants';
import CustomLegend from './custom-legend';

const Chart: FC<{
  chartData: ChartData;
  selectedKeys: string[];
  strokeSize: number;
  selectedColors: { [key: string]: string };
  axisLabels: { x: string; y: string };
  handleColorChange: (color: string, key: string) => void;
}> = ({
  chartData,
  selectedKeys,
  handleColorChange,
  strokeSize,
  selectedColors,
  axisLabels
}) => {
  return (
    <div className="w-full mx-0">
      <ResponsiveContainer className="h-full p-2" width={'100%'} height={900}>
        <LineChart className="p-6 border-2 rounded-md" data={chartData}>
          {!selectedKeys.length ? <h3>Select options from the right</h3> : null}
          <Brush
            y={40}
            height={30}
            className="[&>rect]:stroke-slate-400 [&>rect]:fill-slate-200 dark:[&>rect]:fill-slate-700 my-10"
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
          <Legend
            verticalAlign="top"
            formatter={(value) => (
              <CustomLegend
                value={value}
                handleColorChange={handleColorChange}
                selectedColors={selectedColors}
              />
            )}
          />

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
            padding="gap"
            dy={10}
            angle={-10}
            axisLine={false}
            hide={!axisLabels.x}
            tick={!!axisLabels.x}
            // label={axisLabels.x}
            dataKey={axisLabels.x}
          >
            <Label dy={40} className="mx-20" value={axisLabels.x} offset={20} />
          </XAxis>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
