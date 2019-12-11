
export type ValueOrFactory<T> = T | (() => T);

export function isFunction<T>(f: ValueOrFactory<T>): f is () => T {
  return typeof f === 'function';
}
export function isValue<T>(f: ValueOrFactory<T>): f is T {
  return typeof f !== 'function';
}
export function realize<T>(f: ValueOrFactory<T>): T {
  return isFunction(f) ? f() : f;
}
