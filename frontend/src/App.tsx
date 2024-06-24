import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import {
  Button,
  Tooltip,
  FileInput,
  Label,
  Popover,
  Sidebar,
  Banner,
  ToggleSwitch,
  Drawer,
  DrawerItems
} from 'flowbite-react';
import { HexColorPicker } from 'react-colorful';
import { cn } from './utils/cn';
import { LocalStorageHelpers } from './utils/localstorage-helpers';
import Papa from 'papaparse';
import { uploadHandler } from './utils/upload-handler';
import Nav from './components/nav';
import Heading from './components/heading';
import { ChartData } from './constants';
import Chart from './components/chart';

const strokeSettings = {
  min: 1,
  max: 4
};

export default function App() {
  const [chartData, addData] = useState<ChartData>([]);
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

    const currentFiles = LocalStorageHelpers.getValue<string[]>(
      fetchedData.fileName,
      '[]'
    );

    if (!currentFiles.includes(fetchedData.fileName)) {
      const currFiles = LocalStorageHelpers.getValue<string[]>('files', '[]');

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

  return (
    <div className="h-screen">
      <Nav
        ref={formRef}
        recentFiles={recentFiles}
        isDisabled={isDisabled}
        isProcessing={isProcessing}
        handleSelectRecent={handleSelectRecent}
        handleSubmit={handleSubmit}
      >
        <FileInput
          ref={inputRef}
          accept=".csv, text/csv"
          placeholder=""
          disabled={isProcessing}
          name="telemetry"
          onChange={detectChange}
        />
      </Nav>
      <div className="w-full my-6">
        {currFile && <Heading currFile={currFile} />}

        {availableKeys.length ? (
          <div className="flex lg:flex-row flex-col gap-2 w-full">
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <Sidebar className="px-2 w-full max-h-[200px] lg:max-h-[300px]">
                  <Sidebar.Items className="max-h-[200px] lg:max-h-[300px]">
                    <Sidebar.ItemGroup>
                      {availableKeys.map((key) => (
                        <Sidebar.Item
                          key={key}
                          className="flex flex-row w-full"
                        >
                          <div className="flex gap-2 justify-between">
                            <Label className={`mx-2 flex gap-2`}>
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
                                      style={{
                                        pointerEvents: !selectedKeys.includes(
                                          key
                                        )
                                          ? 'none'
                                          : 'auto',
                                        opacity: selectedKeys.includes(key)
                                          ? '1.0'
                                          : '0.2',
                                        backgroundColor:
                                          selectedColors[key] ?? '#3182bd'
                                      }}
                                      className={cn(
                                        'cursor-pointer h-6 w-6 rounded-full'
                                      )}
                                    ></div>
                                  </Popover>
                                </Tooltip>
                              </span>
                              <Tooltip content={key} placement="right">
                                {key.length > 25
                                  ? key.substring(0, 20) + '...'
                                  : key}
                              </Tooltip>
                            </Label>

                            <ToggleSwitch
                              color="success"
                              className="cursor-pointer"
                              checked={selectedKeys.includes(key)}
                              onChange={(isToggled) =>
                                handleSwitchToggle(isToggled, key)
                              }
                            />
                          </div>
                        </Sidebar.Item>
                      ))}
                    </Sidebar.ItemGroup>
                  </Sidebar.Items>
                </Sidebar>
                <p className="font-light">
                  <code className="underline">{availableKeys.length}</code> data
                  points availabe
                </p>
              </div>
            </div>
            <Chart
              chartData={chartData}
              strokeSize={strokeSize}
              selectedKeys={selectedKeys}
              selectedColors={selectedColors}
            />
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
