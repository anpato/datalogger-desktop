import { FC } from 'react';
import DataMenu from './data-menu';
import { Dropdown, DropdownItem, Select } from 'flowbite-react';
import { Check } from 'lucide-react';

type IProps = {
  availableKeys: string[];
  selectedKeys: string[];
  handleSwitchToggle: (isToggled: boolean, key: string) => void;
  setAxisLabels: (action: 'x' | 'y' | 'clear', key?: string) => void;
  setCalcType: (value: string) => void;
  axisLabels: { x: string; y: string };
};

const calculationItems = ['AFR (MAF)'];

const ActionMenu: FC<IProps> = ({
  availableKeys,
  selectedKeys,
  handleSwitchToggle,
  setAxisLabels,
  axisLabels,
  setCalcType
}) => {
  return (
    <div className="flex flex-row justify-center items-start gap-2 px-4 mt-4">
      <div className="flex flex-row gap-2 items-center">
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
          selectedKeys={selectedKeys}
          handleSwitchToggle={handleSwitchToggle}
        />
        <p className="prose text-center">
          <span className="underline">{selectedKeys.length}</span> data points
          selected
        </p>
      </div>
      <div>
        <Dropdown label="Calculation" outline>
          {calculationItems.map((item) => (
            <DropdownItem
              key={item}
              value={item}
              onClick={() => setCalcType(item)}
            >
              {item}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>
    </div>
  );
};

export default ActionMenu;
