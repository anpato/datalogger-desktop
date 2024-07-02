import { Card } from 'flowbite-react';
import { FC } from 'react';
import { X } from 'lucide-react';
import { ChartData } from '../constants';

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
  return (
    <div className="mx-2 my-6 grid grid-cols-4  gap-4 sticky">
      {Object.keys(widgets).map((widget) => {
        const targetValues = chartData
          .map((d) => d[widget])
          .sort((a, b) => (a < b ? -1 : 1));

        return (
          <Card
            key={widget}
            className="max-w-1/3 relative flex flex-col justify-between items-stretch gap-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-center text-lg flex-1 my-2">{widget}</h3>
              <X
                onClick={() => setWidgets(widget, '', 'delete')}
                className="hover:prose cursor-pointer absolute top-1 right-1"
              />
            </div>
            <div className="text-center">
              <p
                style={{ color: colorMap[widget] ?? '#3182bd' }}
                className={`text-3xl font-extra-bold`}
              >
                {widgets[widget] ? widgets[widget] : '0'}
              </p>
            </div>

            <div className="flex justify-between">
              <div>
                <h5 className="text-center prose">Min</h5>
                <p
                  className="font-bold"
                  style={{ color: colorMap[widget] ?? '#3182bd' }}
                >
                  {targetValues[0] ?? 0}
                </p>
              </div>
              <div>
                <h5 className="text-center prose">Max</h5>
                <p
                  className="font-bold"
                  style={{ color: colorMap[widget] ?? '#3182bd' }}
                >
                  {targetValues[targetValues.length - 1] ?? 0}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
export default Widgets;
