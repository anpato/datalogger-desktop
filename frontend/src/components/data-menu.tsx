import { MegaMenu, Label, ToggleSwitch } from 'flowbite-react';
import { FC } from 'react';

type IProps = {
  availableKeys: string[];
  selectedKeys: string[];
  handleSwitchToggle: (isToggled: boolean, key: string) => void;
};

const DataMenu: FC<IProps> = ({
  availableKeys,

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
                <Label className={`mx-2 flex gap-2`}>{key}</Label>

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
