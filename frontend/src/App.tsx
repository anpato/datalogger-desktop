import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { GetVersionInfo } from '@wailsjs/go/main/App';
import { BrowserOpenURL } from '@wailsjs/runtime';
import { FileInput, Banner, Alert, Button, Footer } from 'flowbite-react';
import { LocalStorageHelpers } from './utils/localstorage-helpers';
import Papa from 'papaparse';
import { uploadHandler } from './utils/upload-handler';
import Nav from './components/nav';
import Heading from './components/heading';
import { ChartData } from './constants';
import Chart from './components/chart';
import DataMenu from './components/data-menu';

const strokeSettings = {
  min: 1,
  max: 4
};

export default function App() {
  const [chartData, addData] = useState<ChartData>([]);
  const [selectedColors, setColor] = useState<{
    [key: string]: string;
  }>({});
  const [versionInfo, setValue] = useState<{
    isDismissed: boolean;
    isLatest: boolean;
    currentVersion: string;
  }>({ isDismissed: true, isLatest: true, currentVersion: '' });
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

  const getVersionData = async () => {
    const versionInfo = (await GetVersionInfo()) as {
      Version: string;
      IsLatest: boolean;
      CurrentVersion: string;
    };

    setValue({
      isLatest: versionInfo.IsLatest,
      currentVersion: versionInfo.CurrentVersion,
      isDismissed: false
    });
  };

  useEffect(() => {
    getVersionData();
  }, []);

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

  const removeAllFiles = () => {
    LocalStorageHelpers.clearAll();
    setRecents([]);
    setSelected([]);
    setKeys([]);
    setColor({});
    setFile('');
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
  const shouldShowAlert = !versionInfo.isLatest && !versionInfo.isDismissed;

  return (
    <div className="h-full">
      {shouldShowAlert && (
        <Alert
          onDismiss={() => setValue((prev) => ({ ...prev, isDismissed: true }))}
          additionalContent={
            <div className="flex gap-2">
              <Button
                size="xs"
                onClick={() =>
                  BrowserOpenURL(
                    'https://github.com/anpato/datalogger-desktop/releases/'
                  )
                }
              >
                Update now
              </Button>
              <Button
                onClick={() =>
                  setValue((prev) => ({ ...prev, isDismissed: true }))
                }
                color="gray"
                size="xs"
              >
                Dismiss
              </Button>
            </div>
          }
        >
          <h2 className="text-lg">Version update available</h2>
        </Alert>
      )}
      <Nav
        ref={formRef}
        currentFile={currFile}
        recentFiles={recentFiles}
        isDisabled={isDisabled}
        isProcessing={isProcessing}
        handleSelectRecent={handleSelectRecent}
        handleSubmit={handleSubmit}
        removeFiles={removeAllFiles}
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
          <>
            <div className="flex flex-row justify-center gap-2 px-4 mt-4">
              <div>
                <DataMenu
                  availableKeys={availableKeys}
                  selectedColors={selectedColors}
                  selectedKeys={selectedKeys}
                  handleColorChange={handleColorChange}
                  handleSwitchToggle={handleSwitchToggle}
                />
                <p className="prose text-center">
                  <span className="underline">{selectedKeys.length}</span> data
                  points selected
                </p>
              </div>
            </div>

            <Chart
              chartData={chartData}
              strokeSize={strokeSize}
              selectedKeys={selectedKeys}
              selectedColors={selectedColors}
            />
          </>
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
      <Footer className="sticky w-full bottom-0 rounded-none p-2 mt-4">
        <Footer.Copyright
          href="#"
          by="anpato"
          year={new Date().getFullYear()}
        />
        <p className="text-gray-500 dark:text-gray-400 ">
          v{versionInfo.currentVersion}
        </p>
      </Footer>
    </div>
  );
}
