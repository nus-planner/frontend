Array.prototype.unique = function () {
  const set = new Set();
  for (const item of this) {
    set.add(item);
  }
  return Array.from(set);
};

Array.prototype.uniqueByKey = function <T, K extends keyof T>(
  this: Array<T>,
  key: K,
) {
  const map = new Map<T[K], T>();
  for (const item of this) {
    map.set(item[key], item);
  }
  return Array.from(map.values());
};

export {};
