import {
  MegaMenu,
  Label,
  Tooltip,
  Popover,
  ToggleSwitch
} from 'flowbite-react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '../utils/cn';
import { FC } from 'react';

type IProps = {
  availableKeys: string[];
  selectedColors: { [key: string]: string };
  selectedKeys: string[];
  handleColorChange: (color: string, key: string) => void;
  handleSwitchToggle: (isToggled: boolean, key: string) => void;
};

const DataMenu: FC<IProps> = ({
  availableKeys,
  selectedColors,
  handleColorChange,
  selectedKeys,
  handleSwitchToggle
}) => {
  return (
    <MegaMenu className="rounded-md border-2">
      <MegaMenu.Dropdown
        className="rounded-md"
        toggle={
          <div className="flex gap-2">
            Data points{' '}
            <span>
              {' | '}
              <code className="underline">{availableKeys.length}</code> data
              points availabe
            </span>
          </div>
        }
      >
        <ul className="p-2 max-h-60 overflow-y-auto">
          {availableKeys.map((key) => (
            <li key={key} className="flex flex-row w-full py-2">
              <div className="flex gap-2 w-full justify-between">
                <Label className={`mx-2 flex gap-2`}>
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
                            pointerEvents: !selectedKeys.includes(key)
                              ? 'none'
                              : 'auto',
                            opacity: selectedKeys.includes(key) ? '1.0' : '0.2',
                            backgroundColor: selectedColors[key] ?? '#3182bd'
                          }}
                          className={cn('cursor-pointer h-6 w-6 rounded-full')}
                        ></div>
                      </Popover>
                    </Tooltip>
                  </span>
                  {key.length > 25 ? (
                    <Tooltip content={key} placement="bottom">
                      {key.length > 25 ? key.substring(0, 20) + '...' : key}
                    </Tooltip>
                  ) : (
                    key
                  )}
                </Label>

                <ToggleSwitch
                  color="success"
                  className="cursor-pointer"
                  checked={selectedKeys.includes(key)}
                  onChange={(isToggled) => handleSwitchToggle(isToggled, key)}
                />
              </div>
            </li>
          ))}
        </ul>
      </MegaMenu.Dropdown>
    </MegaMenu>
  );
};

export default DataMenu;
