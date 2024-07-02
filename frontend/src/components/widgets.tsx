import { FC, useMemo } from 'react';
import { ChartData } from '../constants';
import Widget from './widget';

type IProps = {
  widgets: { [key: string]: string | number };
  colorMap: { [key: string]: string };
  chartData: ChartData;
  setWidgets: (
    key: string,
    value: string | number,
    action: 'add' | 'updated' | 'delete'
  ) => void;
};

const Widgets: FC<IProps> = ({ chartData, widgets, colorMap, setWidgets }) => {
  return useMemo(
    () => (
      <div className="mx-2 my-6 grid grid-cols-4  gap-4 sticky">
        {Object.keys(widgets).map((widget) => {
          const targetValues = chartData
            .map((d) => d[widget])
            .sort((a, b) => (a < b ? -1 : 1)) as string[] | number[];

          return (
            <Widget
              key={widget}
              colorMap={colorMap}
              widgets={widgets}
              targetValues={targetValues}
              setWidgets={setWidgets}
              widget={widget}
            />
          );
        })}
      </div>
    ),
    [setWidgets]
  );
};
export default Widgets;
