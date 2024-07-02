import { FC, useEffect, useMemo } from 'react';
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
import { ChartData, WidgetAction } from '../constants';
import CustomLegend from './custom-legend';
import { CategoricalChartState } from 'recharts/types/chart/types';
import { debounce } from '../utils/debounce';

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
    action: WidgetAction
  ) => void;
  handleChartMouseMove: (props: CategoricalChartState) => void;
}> = ({
  chartData,
  selectedKeys,
  handleColorChange,
  strokeSize,
  selectedColors,
  axisLabels,
  widgets,
  setWidgets,
  handleChartMouseMove
}) => {
  return (
    <div className="w-full">
      <ResponsiveContainer className="h-full" width={'100%'} height={600}>
        <LineChart
          onMouseMove={handleChartMouseMove}
          className=" border-2 rounded-md"
          data={chartData}
        >
          {useMemo(
            () => (
              <>
                {!selectedKeys.length ? (
                  <h3>Select options from the right</h3>
                ) : null}

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
                  <Label
                    dy={40}
                    className="mx-20"
                    value={axisLabels.x}
                    offset={20}
                  />
                </XAxis>
                <Brush
                  height={40}
                  className="[&>rect]:stroke-slate-400 [&>rect]:fill-slate-200 dark:[&>rect]:fill-slate-700 my-10"
                />
              </>
            ),
            [Object.keys(widgets).length, selectedKeys, selectedColors]
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
