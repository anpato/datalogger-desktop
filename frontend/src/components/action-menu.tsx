import { FC } from 'react';
import DataMenu from './data-menu';
import { Dropdown, DropdownItem } from 'flowbite-react';
import { Check } from 'lucide-react';

type IProps = {
  availableKeys: string[];
  selectedColors: { [key: string]: string };
  selectedKeys: string[];
  handleColorChange: (color: string, key: string) => void;
  handleSwitchToggle: (isToggled: boolean, key: string) => void;
  setAxisLabels: (action: 'x' | 'y' | 'clear', key?: string) => void;
  axisLabels: { x: string; y: string };
};

const ActionMenu: FC<IProps> = ({
  availableKeys,
  selectedColors,
  handleColorChange,
  selectedKeys,
  handleSwitchToggle,
  setAxisLabels,
  axisLabels
}) => {
  return (
    <div className="flex flex-row justify-center items-start gap-2 px-4 mt-4">
      <div className="flex flex-row gap-2">
        <Dropdown outline label="Y Axis">
          {availableKeys.map((key) => (
            <DropdownItem
              className="flex justify-between"
              onClick={() =>
                axisLabels.y && axisLabels.y === key
                  ? setAxisLabels('clear')
                  : setAxisLabels('y', key)
              }
              key={key}
            >
              {key}
              {axisLabels.y === key && <Check />}
            </DropdownItem>
          ))}
        </Dropdown>
        <Dropdown outline label="X Axis">
          {availableKeys.map((key) => (
            <DropdownItem
              className="flex justify-between"
              onClick={() =>
                axisLabels.x && axisLabels.x === key
                  ? setAxisLabels('clear')
                  : setAxisLabels('x', key)
              }
              key={key}
            >
              {key}
              {axisLabels.x === key && <Check />}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>
      <div>
        <DataMenu
          availableKeys={availableKeys}
          selectedColors={selectedColors}
          selectedKeys={selectedKeys}
          handleColorChange={handleColorChange}
          handleSwitchToggle={handleSwitchToggle}
        />
        <p className="prose text-center">
          <span className="underline">{selectedKeys.length}</span> data points
          selected
        </p>
      </div>
      <div></div>
    </div>
  );
};

export default ActionMenu;
