import { Popover, Tooltip } from 'flowbite-react';
import { FC } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '../utils/cn';

const CustomLegend: FC<{
  value: string;
  selectedColors: { [key: string]: string };
  handleColorChange: (color: string, key: string) => void;
}> = ({ handleColorChange, selectedColors, value: key }) => {
  return (
    <div className="flex gap-1">
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
      <text> {key}</text>
    </div>
  );
};

export default CustomLegend;
