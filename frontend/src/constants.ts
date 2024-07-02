export type ChartData = { [key: string]: number | string }[];
export type WidgetAction = 'add' | 'updated' | 'delete';
export enum Actions {
  SET_FILE = 'SET_FILE',
  UPDATE_COLORS = 'UPDATE_COLORS',
  SET_CHART = 'SET_CHART',
  UPDATE_KEYS = 'UPDATE_KEYS',
  SET_FILES = 'SET_FILES',
  RESET = 'RESET'
}

export type Action =
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

export type Store = {
  recentFiles: string[];
  selectedKeys: string[];
  currFile: string;
  selectedColors: { [key: string]: string };
  chartData: ChartData;
};
