Array.prototype.unique = function () {
  const set = new Set();
  for (const item of this) {
    set.add(item);
  }
  return Array.from(set);
};

export {};
