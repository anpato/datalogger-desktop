import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as ChartTip
} from 'recharts';
import {
  Button,
  Tooltip,
  Dropdown,
  DropdownItem,
  FileInput,
  Label,
  Navbar,
  Popover,
  Sidebar,
  Banner,
  ToggleSwitch
} from 'flowbite-react';
import { HexColorPicker } from 'react-colorful';
import { cn } from './utils/cn';
import icon from './assets/icon.svg';
import { LocalStorageHelpers } from './utils/localstorage-helpers';
import Papa from 'papaparse';
import { uploadHandler } from './utils/upload-handler';

const strokeSettings = {
  min: 1,
  max: 4
};

export default function App() {
  const [chartData, addData] = useState<{ [key: string]: number | string }[]>(
    []
  );
  const [selectedColors, setColor] = useState<{
    [key: string]: string;
  }>({});
  const [isProcessing, toggleProcessing] = useState<boolean>(false);
  const [strokeSize, setStrokeSize] = useState<number>(2);
  const [currFile, setFile] = useState<string>('');
  const [isDisabled, toggleDisabled] = useState(true);
  const [availableKeys, setKeys] = useState<string[]>([]);
  const [selectedKeys, setSelected] = useState<string[]>([]);
  const [recentFiles, setRecents] = useState<string[]>(
    LocalStorageHelpers.getValue('files', '[]') ?? []
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRecents(JSON.parse(localStorage.getItem('files') ?? '[]') ?? []);
    }
  }, [globalThis.window]);

  const handleSetData = (fetchedData: {
    fileName: string;
    records: { [key: string]: string | number }[];
    headers: string[];
  }) => {
    formRef.current?.reset();
    toggleDisabled(true);
    setFile(fetchedData.fileName);
    setKeys(
      fetchedData.headers.filter((key) => !key.toLowerCase().includes('time'))
    );

    addData(fetchedData.records);

    if (
      !LocalStorageHelpers.getValue<string[]>(
        fetchedData.fileName,
        '[]'
      ).includes(fetchedData.fileName)
    ) {
      const currFiles = LocalStorageHelpers.getValue<string[]>('files');

      LocalStorageHelpers.setAll<{
        fileName: string;
        headers: string[];
        records: { [key: string]: number | string }[];
      }>({
        files: [...currFiles, fetchedData.fileName],
        [fetchedData.fileName]: {
          fileName: fetchedData.fileName,
          headers: fetchedData.headers.filter(
            (key) => !key.toLowerCase().includes('time')
          ),
          records: fetchedData.records
        }
      });

      if (!recentFiles.includes(fetchedData.fileName)) {
        setRecents((prev) => [...prev, fetchedData.fileName]);
      }
    }

    toggleProcessing(false);
  };

  const handleDefaultPrefs = (fileName?: string) => {
    setColor(
      LocalStorageHelpers.getValue(`${fileName ?? currFile}-colors`, '{}')
    );
    console.log(
      LocalStorageHelpers.getValue(`${fileName ?? currFile}-toggled`, '[]')
    );
    setSelected(
      LocalStorageHelpers.getValue(`${fileName ?? currFile}-toggled`, '[]')
    );
  };

  const detectChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      toggleDisabled(false);
    }
  }, []);

  const handleSelectRecent = (fileName: string) => {
    const fileData =
      LocalStorageHelpers.getValue<{
        headers: string[];
        records: { [key: string]: string | number }[];
      }>(fileName, '{}') ?? null;

    if (Object.keys(fileData).length) {
      setKeys(fileData.headers);
      addData(fileData.records);

      setFile(fileName);
    }
  };

  useEffect(() => {
    handleDefaultPrefs();
  }, [currFile]);

  const handleSwitchToggle = (isToggled: boolean, key: string) => {
    if (!selectedKeys.includes(key) && isToggled) {
      setSelected((prev) => {
        const newVals = [...prev, key];
        LocalStorageHelpers.setValues(`${currFile}-toggled`, newVals);
        return newVals;
      });
    } else {
      setSelected((prev) => {
        const newVals = prev.filter((p) => p !== key);
        LocalStorageHelpers.setValues(`${currFile}-toggled`, newVals);
        return newVals;
      });
    }
  };

  const handleColorChange = (color: string, key: string) => {
    setColor((prev) => {
      const newVals = {
        ...prev,
        [key.toString()]: color
      };

      LocalStorageHelpers.setValues(`${currFile}-colors`, newVals);
      return newVals;
    });
  };

  const changeStrokeSize = (direction: 'up' | 'down') => {
    switch (direction) {
      case 'up':
        setStrokeSize((curr) => {
          if (curr < strokeSettings.max) {
            return (curr += 1);
          }
          return curr;
        });
        break;
      case 'down': {
        setStrokeSize((curr) => {
          if (curr > strokeSettings.min) {
            return (curr -= 1);
          }
          return curr;
        });
      }
    }
  };
  const handleSubmit = () => {
    toggleProcessing(true);
    if (inputRef?.current && inputRef.current.files) {
      const file = inputRef.current.files[0];

      Papa.parse(file, {
        complete: (result) => {
          const resultData = [...(result.data ?? [])];
          result.errors?.length &&
            result.errors?.forEach((err) => {
              if (err.row) {
                resultData.splice(err.row, 1);
              }
            });
          const { headers, records } = uploadHandler(resultData as any);

          handleSetData({ headers, records, fileName: file.name });
        },
        header: true
      });
    }
  };
  console.log();
  return (
    <div className="h-full">
      <Navbar fluid border>
        <Navbar.Brand className="flex gap-2">
          <img src={icon} className="w-10" alt="logo" />
          <h3 className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Datalogger
          </h3>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <div className="flex flex-col-reverse lg:flex-row gap-2 items-center">
            <Dropdown inline label="Recent files">
              {recentFiles?.map((file) => (
                <Dropdown.Item
                  onClick={() => handleSelectRecent(file)}
                  key={file}
                >
                  {file}
                </Dropdown.Item>
              ))}
              {!recentFiles.length && (
                <DropdownItem className="cursor-default" disabled>
                  No recent files
                </DropdownItem>
              )}
            </Dropdown>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              ref={formRef}
              className="flex flex-row justify-center items-center gap-2"
            >
              <FileInput
                ref={inputRef}
                accept=".csv, text/csv"
                placeholder=""
                disabled={isProcessing}
                name="telemetry"
                onChange={detectChange}
              />

              <Button
                isProcessing={isProcessing}
                disabled={isDisabled}
                size="sm"
                color="dark"
                type="submit"
                className="p-2 flex justify-between gap-2"
              >
                Upload
              </Button>
            </form>
          </div>
        </Navbar.Collapse>
      </Navbar>
      <div className="w-full my-6">
        {currFile && (
          <div className="flex flex-col items-center">
            <code
              className={cn(
                currFile ? 'visible' : 'invisible',
                'whitespace-nowrap text-wrap text-xl font-semibold dark:text-white mb-2'
              )}
            >
              {currFile}
            </code>

            <h3
              className={cn([
                'prose whitespace-nowraptext-md font-light dark:text-white mb-2'
              ])}
            >
              Select data points from the menu.
            </h3>
          </div>
        )}

        {availableKeys.length ? (
          <div className="flex lg:flex-row flex-col-reverse gap-2 w-full">
            <div className="w-full lg:pl-6">
              <ResponsiveContainer
                className="h-full py-2"
                width={'100%'}
                height={900}
              >
                <LineChart data={chartData}>
                  {!selectedKeys.length ? (
                    <h3>Select options from the right</h3>
                  ) : null}
                  <ChartTip />
                  {selectedKeys.map((key) => {
                    const color =
                      selectedColors && selectedColors[key]
                        ? { stroke: selectedColors[key] }
                        : {};
                    return (
                      <Line
                        strokeWidth={strokeSize}
                        type="monotone"
                        dataKey={key}
                        key={key}
                        dot={false}
                        {...color}
                      />
                    );
                  })}
                  <YAxis
                    type="number"
                    tick={false}
                    scale="auto"
                    domain={['auto', 'auto']}
                  />
                  <XAxis tick={false} label={''} dataKey={'Time (msec)'} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  disabled={strokeSize === strokeSettings.min}
                  outline
                  onClick={() => changeStrokeSize('down')}
                >
                  -
                </Button>
                <p>
                  Current line width: <code>{strokeSize}</code>
                </p>
                <Button
                  disabled={strokeSize === strokeSettings.max}
                  outline
                  onClick={() => changeStrokeSize('up')}
                >
                  +
                </Button>
              </div>
              <Sidebar className="px-4 w-full flex-1">
                <Sidebar.Items className="max-h-[300px] lg:max-h-[800px]">
                  <Sidebar.ItemGroup>
                    {availableKeys.map((key) => (
                      <Sidebar.Item
                        key={key}
                        className="flex flex-row justify-center items-start"
                      >
                        <div className="flex gap-2 items-center">
                          <ToggleSwitch
                            color="success"
                            className="cursor-pointer"
                            checked={selectedKeys.includes(key)}
                            onChange={(isToggled) =>
                              handleSwitchToggle(isToggled, key)
                            }
                          />
                          <Label className={`mx-2 flex items-center gap-2`}>
                            {key.length > 25
                              ? key.substring(0, 20) + '...'
                              : key}

                            <span>
                              {' '}
                              <Tooltip content="Click to pick a color">
                                <Popover
                                  content={
                                    <HexColorPicker
                                      color={selectedColors[key] ?? '#3182bd'}
                                      onChange={(color) =>
                                        handleColorChange(color, key)
                                      }
                                    />
                                  }
                                >
                                  <div
                                    style={
                                      selectedColors && selectedColors[key]
                                        ? {
                                            backgroundColor:
                                              selectedColors[key],
                                            pointerEvents:
                                              !selectedKeys.includes(key)
                                                ? 'none'
                                                : 'auto',
                                            opacity: selectedKeys.includes(key)
                                              ? '1.0'
                                              : '0.2'
                                          }
                                        : {
                                            backgroundColor: '#3182bd',
                                            pointerEvents:
                                              !selectedKeys.includes(key)
                                                ? 'none'
                                                : 'auto',
                                            opacity: !selectedKeys.includes(key)
                                              ? '0.2'
                                              : '1.0'
                                          }
                                    }
                                    className={cn(
                                      'cursor-pointer h-6 w-6 rounded-full'
                                    )}
                                  ></div>
                                </Popover>
                              </Tooltip>
                            </span>
                          </Label>
                        </div>
                        <div></div>
                      </Sidebar.Item>
                    ))}
                  </Sidebar.ItemGroup>
                </Sidebar.Items>
              </Sidebar>
            </div>
          </div>
        ) : (
          <Banner className="">
            <div className="w-[80%] mx-auto border rounded-md border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
              <h3 className="text-center">Upload a file to get started</h3>

              <p className="font-bold text-center my-2">OR</p>
              <p className="text-center">Choose one of your recent files</p>
            </div>
          </Banner>
        )}
      </div>
    </div>
  );
}
