export const removeAtIndex = (array, index) => {
  return [...array.slice(0, index), ...array.slice(index + 1)];
};

export const insertAtIndex = (array, index, item) => {
  return [...array.slice(0, index), item, ...array.slice(index)];
};

export function removeAtIndexInplace(array: Array<any>, index: number) {
  array.splice(0, array.length, ...removeAtIndex(array, index));
}

export const insertAtIndexInplace = (
  array: Array<any>,
  index: number,
  item: any
) => {
  array.splice(index, 0, item);
};

// https://stackoverflow.com/questions/37318808/what-is-the-in-place-alternative-to-array-prototype-filter
export function filterInPlace<T>(a: Array<T>, condition: (val: T) => boolean) {
  let i = 0,
    j = 0;

  while (i < a.length) {
    const val = a[i];
    if (condition(val)) {
      a[j++] = val;
    }
    i++;
  }

  a.length = j;
  return a;
}
