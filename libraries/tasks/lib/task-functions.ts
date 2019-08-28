/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventEmitter } from 'events';
import { ManualPromise } from './manual-promise';
import { promisify } from './node-promisify';

/**
 * Creates a promise that resolves after a delay
 * 
 * @param delayMS the length of time to delay in milliseconds.
 */
export function Delay(delayMS: number): Promise<void> {
  return new Promise<void>(res => setTimeout(res, delayMS));
}

export function YieldCPU(): Promise<void> | undefined {
  if ((<any>process)._getActiveHandles().length > 2) {
    return new Promise(res => setImmediate(res));
  }
  return undefined;
}

/**
 * Asynchronously waits for the predicate condition to turn false, with a delay between checks 
 * @param predicate - a fn that returns a boolean
 * @param delay - number of milliseconds to async delay between checks.
 */
export async function While(predicate: () => boolean, delay = 50): Promise<void> {
  while (predicate()) {
    await Delay(delay);
  }
}

/**
 * Asynchronously waits for the predicate condition to turn true, with a delay between checks 
 * @param predicate - a fn that returns a boolean
 * @param delay - number of milliseconds to async delay between checks.
 */
export async function Until(predicate: () => boolean, delay = 50): Promise<void> {
  while (predicate()) {
    await Delay(delay);
  }
}

/**
 * An async wrapper for waiting for an event to trigger once 
 * @param emitter - an event emitter
 * @param event - the name of the event to wait for.
 */
export function When<T>(emitter: EventEmitter, successEvent?: string, errorEvent?: string): Promise<T> {
  const result = new ManualPromise<T>();

  if (errorEvent) {
    // errors after a previous completion are ignored.
    emitter.once(errorEvent, (e: any) => {
      if (!result.isCompleted) {
        result.reject(e);
      }
    });
  }

  if (successEvent) {
    // success after a previous completion is ignored.
    emitter.once(successEvent, (v: T) => {
      if (!result.isCompleted) {
        result.resolve(v);
      }
    });
  }

  return result;
}

export function Async<T>(fn: () => T, msec = 1): Promise<T> {
  return new Promise((r, j) => setTimeout(() => {
    try { r(fn()); } catch (E) { j(E); }
  }, msec));
}

export async function Timeout<T>(p: Promise<T>, msec: number): Promise<T> {
  let enabled = false;
  const value = await Promise.race([p, Async(() => { if (enabled) throw new Error('timed out'); }, msec)]);
  enabled = false;
  return value as T;
}