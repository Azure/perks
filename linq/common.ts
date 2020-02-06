export interface Index<T> {
  [key: number]: T;
}

export interface Dictionary<T> {
  [key: string]: T;
}

export class Dictionary<T> implements Dictionary<T> {
}

export function ToDictionary<T>(keys: Array<string>, each: (index: string) => T) {
  const result = new Dictionary<T>();
  keys.map((v, i, a) => result[v] = each(v));
  return result;
}

export type IndexOf<T> = T extends Map<T, infer V> ? T : T extends Array<infer V> ? number : string;

/** performs a truthy check on the value, and calls onTrue when the condition is true,and onFalse when it's not */
export function when<T>(value: T, onTrue: (value: NonNullable<T>) => void, onFalse: () => void = () => { }) {
  return value ? onTrue(<NonNullable<T>>value) : onFalse();
}


