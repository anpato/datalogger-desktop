import { Card } from 'flowbite-react';
import { X } from 'lucide-react';
import { FC, useEffect } from 'react';

type IProps = {
  widgets: { [key: string]: string | number };
  widget: string;
  colorMap: { [key: string]: string };
  setWidgets: (
    key: string,
    value: string | number,
    action: 'add' | 'updated' | 'delete'
  ) => void;
  targetValues: number[] | string[];
};

const Widget: FC<{
  widgets: { [key: string]: string | number };
  widget: string;
  colorMap: { [key: string]: string };
  setWidgets: (
    key: string,
    value: string | number,
    action: 'add' | 'updated' | 'delete'
  ) => void;
  targetValues: number[] | string[];
}> = ({ widget, setWidgets, targetValues, colorMap, widgets }) => {
  useEffect(() => {}, [widget, setWidgets]);
  return (
    <Card className="max-w-1/3 relative flex flex-col justify-between items-stretch gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-center text-lg flex-1 my-2 text-slate-400">
          {widget}
        </h3>
        <X
          onClick={() => setWidgets(widget, '', 'delete')}
          className="hover:prose cursor-pointer absolute top-1 right-1"
        />
      </div>
      <div className="text-center">
        <p className={`text-3xl font-extra-bold`}>
          {widgets[widget] ? widgets[widget] : '0'}
        </p>
      </div>

      <div className="flex justify-between">
        <div>
          <h5 className="text-center prose">Min</h5>
          <p className="font-bold text-green-500">{targetValues[0] ?? 0}</p>
        </div>
        <div>
          <h5 className="text-center prose">Max</h5>
          <p className="font-bold text-red-600">
            {targetValues[targetValues.length - 1] ?? 0}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Widget;
