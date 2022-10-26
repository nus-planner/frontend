interface Array<T> {
  unique(): Array<T>;
  uniqueByKey<K extends keyof T>(key: K): Array<T>;
}
