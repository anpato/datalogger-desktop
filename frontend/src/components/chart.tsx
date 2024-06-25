import { FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as ChartTip
} from 'recharts';
import { ChartData } from '../constants';

const Chart: FC<{
  chartData: ChartData;
  selectedKeys: string[];
  strokeSize: number;
  selectedColors: { [key: string]: string };
}> = ({ chartData, selectedKeys, strokeSize, selectedColors }) => {
  return (
    <div className="w-full mx-0">
      <ResponsiveContainer className="h-full p-2" width={'100%'} height={900}>
        <LineChart className="border-2 rounded-lg" data={chartData}>
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
          <YAxis
            hide={true}
            type="number"
            tick={false}
            scale="auto"
            domain={['auto', 'auto']}
          />
          <XAxis hide={true} tick={false} label={''} dataKey={'Time (msec)'} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
