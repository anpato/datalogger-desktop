import {
  ChangeEvent,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react';
import { GetVersionInfo } from '@wailsjs/go/main/App';
import { BrowserOpenURL } from '@wailsjs/runtime';
import { FileInput, Banner, Alert, Button, Footer } from 'flowbite-react';
import { Storage } from './utils/storage';
import Papa from 'papaparse';
import { uploadHandler } from './utils/upload-handler';
import Nav from './components/nav';
import Heading from './components/heading';
import { ChartData } from './constants';
import Chart from './components/chart';

import ActionMenu from './components/action-menu';
import Widgets from './components/widgets';

const strokeSettings = {
  min: 1,
  max: 4
};

enum Actions {
  SET_FILE = 'SET_FILE',
  UPDATE_COLORS = 'UPDATE_COLORS',
  SET_CHART = 'SET_CHART',
  UPDATE_KEYS = 'UPDATE_KEYS',
  SET_FILES = 'SET_FILES',
  RESET = 'RESET'
}

type Action =
  | {
      type: Actions.SET_FILE;
      payload: string;
    }
  | {
      type: Actions.UPDATE_COLORS;
      payload: { [key: string]: string };
    }
  | { type: Actions.SET_CHART; payload: ChartData }
  | { type: Actions.UPDATE_KEYS; payload: string[] }
  | { type: Actions.SET_FILES; payload: string[] }
  | { type: Actions.RESET; payload: null };

type Store = {
  recentFiles: string[];
  selectedKeys: string[];
  currFile: string;
  selectedColors: { [key: string]: string };
  chartData: ChartData;
};

const IState: Store = {
  recentFiles: [],
  selectedKeys: [],
  currFile: '',
  selectedColors: {},
  chartData: []
};

const reducer = (state: Store, { type, payload }: Action): Store => {
  switch (type) {
    case 'SET_FILE':
      return { ...state, currFile: payload };
    case 'UPDATE_COLORS':
      return {
        ...state,
        selectedColors: { ...state.selectedColors, ...payload }
      };
    case 'SET_FILES':
      return { ...state, recentFiles: payload };
    case 'SET_CHART':
      return { ...state, chartData: payload };
    case 'UPDATE_KEYS':
      return { ...state, selectedKeys: payload };
    case 'RESET':
      return IState;
    default:
      return state;
  }
};

export default function App() {
  const [store, dispatch] = useReducer(reducer, IState);
  const [widgets, setWidgets] = useState<{ [key: string]: number | string }>(
    {}
  );
  const [versionInfo, setValue] = useState<{
    isDismissed: boolean;
    isLatest: boolean;
    currentVersion: string;
  }>({ isDismissed: true, isLatest: true, currentVersion: '' });

  const [isProcessing, toggleProcessing] = useState<boolean>(false);
  const [strokeSize, setStrokeSize] = useState<number>(2);

  const [isDisabled, toggleDisabled] = useState(true);
  const [availableKeys, setKeys] = useState<string[]>([]);

  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [labels, setLabels] = useState<{ x: string; y: string }>({
    x: '',
    y: ''
  });

  useEffect(() => {
    async function getRecents() {
      const rec = await Storage.getValue();

      dispatch({
        type: Actions.SET_FILES,
        payload: (rec?.files as string[]) ?? []
      });
    }
    getRecents();
  }, []);

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

  const setAxisLabels = (action: 'x' | 'y' | 'clear', key?: string) => {
    if (action === 'clear') {
      setLabels({ x: '', y: '' });
    }

    setLabels((prev) => ({ ...prev, [action]: key ?? '' }));
  };

  const handleSetData = async (fetchedData: {
    fileName: string;
    records: { [key: string]: string | number }[];
    headers: string[];
  }) => {
    const currentData = await Storage.getValue<{
      files: string[];
      [key: string]: {};
    }>();
    setLabels({ x: '', y: '' });

    formRef.current?.reset();
    toggleDisabled(true);
    dispatch({ type: Actions.SET_FILE, payload: fetchedData.fileName });
    setKeys(fetchedData.headers);
    dispatch({ type: Actions.SET_CHART, payload: fetchedData.records });

    await Storage.setValues({
      ...currentData,
      files: currentData.files
        ? [...(currentData.files ?? []), fetchedData.fileName]
        : [fetchedData.fileName],
      [fetchedData.fileName]: {
        fileName: fetchedData.fileName,
        headers: fetchedData.headers,
        records: fetchedData.records
      }
    });

    if (!store.recentFiles.includes(fetchedData.fileName)) {
      dispatch({
        type: Actions.SET_FILES,
        payload: [...store.recentFiles, fetchedData.fileName]
      });
    }

    toggleProcessing(false);
  };

  const handleDefaultPrefs = async (fileName?: string) => {
    const currentStore = await Storage.getValue();
    dispatch({
      type: Actions.UPDATE_COLORS,
      payload:
        (currentStore[`${fileName ?? store.currFile}-colors`] as {
          [key: string]: string;
        }) ?? {}
    });

    dispatch({
      type: Actions.UPDATE_KEYS,
      payload:
        (currentStore[`${fileName ?? store.currFile}-toggled`] as string[]) ??
        []
    });
    setWidgets({});
  };

  const detectChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      toggleDisabled(false);
    }
  }, []);

  const handleSelectRecent = async (fileName: string) => {
    const fileData =
      (await Storage.getValue<{
        fileName: string;
        headers: string[];
        records: { [key: string]: string | number }[];
        [key: string]: string[] | any;
      }>()) ?? null;

    if (Object.keys(fileData).length) {
      dispatch({
        type: Actions.UPDATE_KEYS,
        payload: fileData[`${fileName}-toggled`] ?? []
      });

      dispatch({
        type: Actions.UPDATE_COLORS,
        payload: fileData[`${fileName}-colors`] ?? {}
      });

      setKeys(fileData[fileName]?.headers ?? []);

      dispatch({
        type: Actions.SET_CHART,
        payload: fileData[fileName]?.records ?? []
      });

      dispatch({ type: Actions.SET_FILE, payload: fileName });
    }
  };

  const removeAllFiles = () => {
    Storage.clearAll();
    dispatch({ type: Actions.RESET, payload: null });
    setKeys([]);
  };

  useEffect(() => {
    handleDefaultPrefs();
  }, [store.currFile]);

  const handleSwitchToggle = async (isToggled: boolean, key: string) => {
    const keys =
      !store.selectedKeys.includes(key) && isToggled
        ? [...store.selectedKeys, key]
        : store.selectedKeys.filter((k) => k !== key);

    if (!isToggled) {
      setWidgets((prev) => {
        delete prev[key];
        return { ...prev };
      });
    }

    dispatch({
      type: Actions.UPDATE_KEYS,
      payload: keys
    });

    const curr = await Storage.getValue();
    Storage.setValues({
      ...curr,
      [`${store.currFile}-toggled`]: keys
    });
  };

  const handleColorChange = async (color: string, key: string) => {
    const payload = {
      ...store.selectedColors,
      [key.toString()]: color
    };
    dispatch({
      type: Actions.UPDATE_COLORS,
      payload
    });
    const curr = await Storage.getValue();
    Storage.setValues({
      ...curr,
      [`${store.currFile}-colors`]: payload
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

  const handleSetWidget = (
    key: string,
    value: string | number,
    action: 'add' | 'updated' | 'delete'
  ) => {
    switch (action) {
      case 'add':
        setWidgets((prev) => ({
          ...prev,
          [key]: value ?? '0'
        }));
        break;
      case 'updated':
        if (Object.hasOwn(widgets, key)) {
          setWidgets((prev) => ({
            ...prev,
            [key]: value
          }));
        }
        break;
      case 'delete':
        console.log('Hello');
        setWidgets((prev) => {
          delete prev[key];
          return { ...prev };
        });
        break;
      default:
        break;
    }
  };

  const shouldShowAlert = !versionInfo.isLatest && !versionInfo.isDismissed;

  return (
    <div>
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
        currentFile={store.currFile}
        recentFiles={store.recentFiles}
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
      <div className="w-full h-full mt-6">
        {store.currFile && <Heading currFile={store.currFile} />}

        {availableKeys.length ? (
          <>
            <ActionMenu
              axisLabels={labels}
              availableKeys={availableKeys}
              selectedKeys={store.selectedKeys}
              handleSwitchToggle={handleSwitchToggle}
              setAxisLabels={setAxisLabels}
            />
            <Widgets
              chartData={store.chartData}
              setWidgets={handleSetWidget}
              widgets={widgets}
              colorMap={store.selectedColors}
            />
            <Chart
              widgets={widgets}
              setWidgets={handleSetWidget}
              handleColorChange={handleColorChange}
              axisLabels={labels}
              chartData={store.chartData}
              strokeSize={strokeSize}
              selectedKeys={store.selectedKeys}
              selectedColors={store.selectedColors}
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
    </div>
  );
}
