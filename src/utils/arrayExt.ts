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

Array.prototype.filtered = function <T>(
  this: Array<T>,
  filter: (t: T) => boolean,
) {
  let i = 0,
    j = 0;

  while (i < this.length) {
    if (filter(this[i])) {
      this[j] = this[i];
      j++;
    }
    i++;
  }

  this.length = j;
  return this;
};

export {};
