import { Popover, Tooltip } from 'flowbite-react';
import { FC } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '../utils/cn';
import { Link } from 'lucide-react';

const CustomLegend: FC<{
  value: string;
  selectedColors: { [key: string]: string };
  handleColorChange: (color: string, key: string) => void;
  setWidgets: (
    key: string,
    value: string | number,
    action: 'add' | 'updated'
  ) => void;
  widgets: { [key: string]: number | string };
}> = ({
  handleColorChange,
  selectedColors,
  value: key,
  setWidgets,
  widgets
}) => {
  return (
    <div className="flex gap-2">
      <span>
        {' '}
        <Tooltip content="Click to pick a color">
          <Popover
            content={
              <HexColorPicker
                color={selectedColors[key] ?? '#3182bd'}
                onChange={(color) => handleColorChange(color, key)}
              />
            }
          >
            <div
              style={{
                backgroundColor: selectedColors[key] ?? '#3182bd'
              }}
              className={cn('cursor-pointer h-6 w-6 rounded-full')}
            ></div>
          </Popover>
        </Tooltip>
      </span>
      <div className="flex gap-2">
        <text>{key}</text>

        <Tooltip
          className={Object.hasOwn(widgets, key) ? 'hidden' : 'visible'}
          content={'Click to pin as a widget'}
        >
          <Link
            onClick={() => setWidgets(key, '', 'add')}
            className={`hover:opacity-45`}
            style={
              Object.hasOwn(widgets, key)
                ? { pointerEvents: 'none', opacity: 0.3 }
                : { cursor: 'pointer' }
            }
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default CustomLegend;
