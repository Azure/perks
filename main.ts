
// pull in source-map support for stack traces.
require('source-map-support').install({ hookRequire: true });

import { EventEmitter } from "events"

export * from './lib/exception'
export * from './lib/outstanding-task-awaiter'
export * from "./lib/lazy-promise"
export * from "./lib/lazy"

/** 
 * Creates a shallow copy of a given object by copying the properties to a new object
 * Note: this does not copy the method prototypes, so it's a shallow data copy only.
 * 
 * @param {input} any javascript object 
 * @param {filter} Array<string> of properties to filter out from the copy.
 */
export function shallowCopy(input: any, ...filter: Array<string>): any {
  if (!input) {
    return input;
  }
  const keys = input.Keys ? input.Keys : Object.getOwnPropertyNames(input);

  const result: any = {};
  for (const key of keys) {
    if (filter.indexOf(key) == -1) {
      const value = input[key];
      if (value !== undefined) {
        result[key] = value;
      }
    }
  }
  return result;
}

export function Delay(delayMS: number): Promise<void> {
  return new Promise<void>(res => setTimeout(res, delayMS));
}

export class ManualPromise<T> implements Promise<T> {
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
    return this.p.then(onfulfilled);
  }
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
    return this.p.catch(onrejected);
  }
  readonly [Symbol.toStringTag]: "Promise";

  public resolve: (value?: T | PromiseLike<T> | undefined) => void = (v) => { };
  public reject: (e: any) => void = (e) => { };
  private p: Promise<T>;
  public constructor() {
    this.p = new Promise<T>((r, j) => { this.resolve = r; this.reject = j });
  }
}

export class CriticalSection {
  private promise: ManualPromise<void> | undefined;

  public async enter(): Promise<void> {
    while (this.promise) {
      await Delay(10);
      // wait for its release
      await this.promise;

      // make sure it's still not busy
      if (this.promise) {
        continue;
      }
    }
    this.promise = new ManualPromise<void>();
  }

  public async exit(): Promise<void> {
    const p = this.promise;
    this.promise = undefined
    if (p) {
      p.resolve();
    }
  }
}

/**
 * Asynchronously waits for the predicate condition to turn false, with a delay between checks 
 * @param predicate - a fn that returns a boolean
 * @param delay - number of milliseconds to async delay between checks.
 */
export async function While(predicate: () => boolean, delay: number = 50): Promise<void> {
  while (predicate()) {
    await Delay(delay);
  }
}

/**
 * Asynchronously waits for the predicate condition to turn true, with a delay between checks 
 * @param predicate - a fn that returns a boolean
 * @param delay - number of milliseconds to async delay between checks.
 */
export async function Until(predicate: () => boolean, delay: number = 50): Promise<void> {
  while (predicate()) {
    await Delay(delay);
  }
}

/**
 * An async wrapper for waiting for an event to trigger once 
 * @param emitter - an event emitter
 * @param event - the name of the event to wait for.
 */
export function When<T>(emitter: EventEmitter, event: string): Promise<T> {
  return new Promise<T>((r, j) => emitter.once(event, r))
}
