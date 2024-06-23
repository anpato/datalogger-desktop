export class LocalStorageHelpers {
  static setValues(
    key: string,
    values:
      | string[]
      | { [key: string]: number | string }[]
      | { [key: string]: string }
  ) {
    typeof window !== 'undefined' &&
      localStorage.setItem(key, JSON.stringify(values));
  }

  static getValue<V>(key: string, defaultReturn: '[]' | '{}' | '' = ''): V {
    return typeof window !== 'undefined'
      ? localStorage.getItem(key)
        ? JSON.parse(localStorage.getItem(key) ?? defaultReturn)
        : JSON.parse(defaultReturn)
      : '';
  }

  static setAll<T>(
    entrys: Record<
      string,
      | string[]
      | { [key: string]: number | string }[]
      | { [key: string]: string }
      | T
    >
  ) {
    for (const key in entrys) {
      LocalStorageHelpers.setValues(
        key,
        entrys[key] as { [key: string]: number | string }[]
      );
    }
  }
}
