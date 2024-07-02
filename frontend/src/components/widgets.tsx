import { Card } from 'flowbite-react';
import { FC } from 'react';
import { X } from 'lucide-react';

type IProps = {
  widgets: { [key: string]: string | number };
  colorMap: { [key: string]: string };
  setWidgets: (
    key: string,
    value: string | number,
    action: 'add' | 'updated' | 'delete'
  ) => void;
};

const Widgets: FC<IProps> = ({ widgets, colorMap, setWidgets }) => {
  return (
    <div className="mx-2 my-6 grid grid-cols-4  gap-4 sticky">
      {Object.keys(widgets).map((widget) => (
        <Card key={widget} className="max-w-1/3">
          <div className="flex items-center justify-between">
            <h3 className="text-center text-xl flex-1">{widget}</h3>
            <X
              onClick={() => setWidgets(widget, '', 'delete')}
              className="hover:prose cursor-pointer"
            />
          </div>
          <div className="text-center">
            <p
              style={{ color: colorMap[widget] ?? '#3182bd' }}
              className={`text-3xl`}
            >
              {widgets[widget] ? widgets[widget] : '0'}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};
export default Widgets;
