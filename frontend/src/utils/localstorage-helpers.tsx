import { GetResult, StoreResult } from '@wailsjs/go/main/App';
import { ChartData } from '../constants';

type JsonData = {
  [key: string]: string[] | Record<string, string | string[] | ChartData>;
};

export class LocalStorageHelpers {
  static async setValues(values: JsonData) {
    await StoreResult(values);
  }

  static async getValue<V = JsonData>(
    defaultReturn: '[]' | '{}' | '' = '{}'
  ): Promise<V> {
    const data = await GetResult();

    if (!data) {
      return JSON.parse(defaultReturn);
    }

    return JSON.parse(data) ?? JSON.parse(defaultReturn);
  }

  static async clearAll() {
    return await StoreResult({});
  }
}
