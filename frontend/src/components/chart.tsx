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
  Label
} from 'recharts';
import { ChartData } from '../constants';
import CustomLegend from './custom-legend';

const Chart: FC<{
  chartData: ChartData;
  selectedKeys: string[];
  strokeSize: number;
  selectedColors: { [key: string]: string };
  widgets: { [key: string]: string | number };
  axisLabels: { x: string; y: string };
  handleColorChange: (color: string, key: string) => void;
  setWidgets: (
    key: string,
    value: string | number,
    action: 'add' | 'updated'
  ) => void;
}> = ({
  chartData,
  selectedKeys,
  handleColorChange,
  strokeSize,
  selectedColors,
  axisLabels,
  widgets,
  setWidgets
}) => {
  return (
    <div className="w-full mx-0">
      <ResponsiveContainer className="h-full p-2" width={'100%'} height={600}>
        <LineChart
          onMouseMove={(props) =>
            props.activePayload?.forEach((item) => {
              setWidgets(item.dataKey, item.payload[item.dataKey], 'updated');
            })
          }
          className="p-6 border-2 rounded-md"
          data={chartData}
        >
          {!selectedKeys.length ? <h3>Select options from the right</h3> : null}

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
                widgets={widgets}
                value={value}
                setWidgets={setWidgets}
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
            hide={true}
            tick={false}
            dataKey={axisLabels.x}
          >
            <Label dy={40} className="mx-20" value={axisLabels.x} offset={20} />
          </XAxis>
          <Brush
            height={40}
            className="[&>rect]:stroke-slate-400 [&>rect]:fill-slate-200 dark:[&>rect]:fill-slate-700 my-10"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
