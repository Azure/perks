/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { IndexOf, Dictionary } from './common';


/*
  * Reverses the elements in an Array.
  * reverse(): T[];
  */


export interface IterableWithLinq<T> extends Iterable<T> {
  linq: IterableWithLinq<T>;
  any(predicate?: (each: T) => boolean): boolean;
  all(predicate: (each: T) => boolean): boolean;
  bifurcate(predicate: (each: T) => boolean): Array<Array<T>>;
  concat(more: Iterable<T>): IterableWithLinq<T>;
  distinct(selector?: (each: T) => any): IterableWithLinq<T>;
  first(predicate?: (each: T) => boolean): T | undefined;
  selectNonNullable<V>(selector: (each: T) => V): IterableWithLinq<NonNullable<V>>;
  select<V>(selector: (each: T) => V): IterableWithLinq<V>;
  selectMany<V>(selector: (each: T) => Iterable<V>): IterableWithLinq<V>;
  where(predicate: (each: T) => boolean): IterableWithLinq<T>;
  forEach(action: (each: T) => void): void;
  aggregate<A, R>(accumulator: (current: T | A, next: T) => A, seed?: T | A, resultAction?: (result?: T | A) => A | R): T | A | R | undefined;
  toArray(): Array<T>;

  /**
     * Gets or sets the length of the iterable. This is a number one higher than the highest element defined in an array.
     */
  count(): number;

  /**
    * Adds all the elements of an array separated by the specified separator string.
    * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
    */
  join(separator?: string): string;

}

/* eslint-disable */

function linqify<T>(iterable: Iterable<T>): IterableWithLinq<T> {
  if ((<any>iterable)['linq'] === iterable) {
    return <IterableWithLinq<T>>iterable;
  }
  const r = <any>{
    [Symbol.iterator]: iterable[Symbol.iterator].bind(iterable),
    all: <any>all.bind(iterable),
    any: <any>any.bind(iterable),
    bifurcate: <any>bifurcate.bind(iterable),
    concat: <any>concat.bind(iterable),
    distinct: <any>distinct.bind(iterable),
    first: <any>first.bind(iterable),
    select: <any>select.bind(iterable),
    selectMany: <any>selectMany.bind(iterable),
    selectNonNullable: <any>selectNonNullable.bind(iterable),
    toArray: <any>toArray.bind(iterable),
    where: <any>where.bind(iterable),
    forEach: <any>forEach.bind(iterable),
    aggregate: <any>aggregate.bind(iterable),
    join: <any>join.bind(iterable),
    count: len.bind(iterable)
  };
  r.linq = r;
  return r;
}

function len<T>(this: Iterable<T>): number {
  return length(this);
}

/** returns an IterableWithLinq<> for keys in the collection */
export function keys<K, T, TSrc extends (Array<T> | Dictionary<T> | Map<K, T>)>(source: TSrc & (Array<T> | Dictionary<T> | Map<K, T>) | null | undefined): IterableWithLinq<IndexOf<TSrc>> {
  if (source) {
    if (Array.isArray(source)) {
      return <IterableWithLinq<IndexOf<TSrc>>>linqify((<Array<T>>source).keys());
    }

    if (source instanceof Map) {
      return <IterableWithLinq<IndexOf<TSrc>>><unknown>linqify((<Map<K, T>>source).keys());
    }

    if (source instanceof Set) {
      throw new Error('Unable to iterate keys on a Set');
    }

    return <IterableWithLinq<IndexOf<TSrc>>>linqify((Object.getOwnPropertyNames(source)));
  }
  // undefined/null
  return linqify([]);
}
function isIterable<T>(source: any): source is Iterable<T> {
  return !!source && !!source[Symbol.iterator];
}

/** returns an IterableWithLinq<> for values in the collection 
 * 
 * @note - null/undefined/empty values are considered 'empty'
*/
export function values<K, T, TSrc extends (Array<T> | Dictionary<T> | Map<K, T>)>(...sources: Array<(Iterable<T> | Array<T> | Dictionary<T> | Map<K, T> | Set<T>) | null | undefined>): IterableWithLinq<T> {
  return linqify({
    [Symbol.iterator]: function* () {
      for (const each of sources) {
        yield* _values(each);
      }
    }
  })
}
/** returns an IterableWithLinq<> for values in the collection */
function _values<K, T, TSrc extends (Array<T> | Dictionary<T> | Map<K, T>)>(source: (Iterable<T> | Array<T> | Dictionary<T> | Map<K, T> | Set<T>) | null | undefined): IterableWithLinq<T> {
  if (source) {
    // map
    if (source instanceof Map || source instanceof Set) {
      return linqify(source.values());
    }

    // any iterable source
    if (isIterable(source)) {
      return linqify(source);
    }

    // dictionary (object keys)
    return linqify(function* () {
      for (const key of keys(source)) {
        const value = source[key];
        if (typeof value !== 'function') {
          yield value;
        }
      }
    }());
  }

  // null/undefined
  return linqify([]);
}

/** returns an IterableWithLinq<{key,value}> for the source */
export function items<K, T, TSrc extends (Array<T> | Dictionary<T> | Map<K, T> | undefined | null)>(source: TSrc & (Array<T> | Dictionary<T> | Map<K, T>) | null | undefined): IterableWithLinq<{ key: IndexOf<TSrc>; value: T }> {
  if (source) {
    if (Array.isArray(source)) {
      return <IterableWithLinq<{ key: IndexOf<TSrc>; value: T }>>linqify(function* () { for (let i = 0; i < source.length; i++) { yield { key: i, value: source[i] }; } }());
    }

    if (source instanceof Map) {
      return <IterableWithLinq<{ key: IndexOf<TSrc>; value: T }>>linqify(function* () { for (const [key, value] of source.entries()) { yield { key, value }; } }());
    }

    if (source instanceof Set) {
      throw new Error('Unable to iterate items on a Set');
    }

    return <IterableWithLinq<{ key: IndexOf<TSrc>; value: T }>><unknown>linqify(function* () {
      for (const key of keys(source)) {
        const value = source[<string>key];
        if (typeof value !== 'function') {
          yield {
            key, value: source[<string>key]
          };
        }
      }
    }());
  }
  // undefined/null
  return linqify([]);
}

export function length<T, K>(source?: string | Iterable<T> | Dictionary<T> | Array<T> | Map<K, T> | Set<T>): number {
  if (source) {
    if (Array.isArray(source) || typeof (source) === 'string') {
      return source.length;
    }
    if (source instanceof Map || source instanceof Set) {
      return source.size;
    }
    if (isIterable(source)) {
      return [...source].length;
    }
    return source ? Object.getOwnPropertyNames(source).length : 0;
  }
  return 0;
}

function any<T>(this: Iterable<T>, predicate?: (each: T) => boolean): boolean {
  for (const each of this) {
    if (!predicate || predicate(each)) {
      return true;
    }
  }
  return false;
}

function all<T>(this: Iterable<T>, predicate: (each: T) => boolean): boolean {
  for (const each of this) {
    if (!predicate(each)) {
      return false;
    }
  }
  return true;
}

function concat<T>(this: Iterable<T>, more: Iterable<T>): IterableWithLinq<T> {
  return linqify(function* (this: Iterable<T>) {
    for (const each of this) {
      yield each;
    }
    for (const each of more) {
      yield each;
    }
  }.bind(this)());
}

function select<T, V>(this: Iterable<T>, selector: (each: T) => V): IterableWithLinq<V> {
  return linqify(function* (this: Iterable<T>) {
    for (const each of this) {
      yield selector(each);
    }
  }.bind(this)());
}

function selectMany<T, V>(this: Iterable<T>, selector: (each: T) => Iterable<V>): IterableWithLinq<V> {
  return linqify(function* (this: Iterable<T>) {
    for (const each of this) {
      for (const item of selector(each)) {
        yield item;
      }
    }
  }.bind(this)());
}

function where<T>(this: Iterable<T>, predicate: (each: T) => boolean): IterableWithLinq<T> {
  return linqify(function* (this: Iterable<T>) {
    for (const each of this) {
      if (predicate(each)) {
        yield each;
      }
    }
  }.bind(this)());
}

function forEach<T>(this: Iterable<T>, action: (each: T) => void) {
  for (const each of this) {
    action(each);
  }
}

function aggregate<T, A, R>(this: Iterable<T>, accumulator: (current: T | A, next: T) => A, seed?: T | A, resultAction?: (result?: T | A) => A | R): T | A | R | undefined {
  let result: T | A | undefined = seed;
  for (const each of this) {
    if (result === undefined) {
      result = each;
      continue;
    }
    result = accumulator(result, each);
  }
  return resultAction !== undefined ? resultAction(result) : result;
}

function selectNonNullable<T, V>(this: Iterable<T>, selector: (each: T) => V): IterableWithLinq<NonNullable<V>> {
  return linqify(function* (this: Iterable<T>) {
    for (const each of this) {
      const value = selector(each);
      if (value) {
        yield <NonNullable<V>><any>value;
      }
    }
  }.bind(this)());
}

function nonNullable<T>(this: Iterable<T>): IterableWithLinq<NonNullable<T>> {
  return linqify(function* (this: Iterable<T>) {
    for (const each of this) {
      if (each) {
        yield <NonNullable<T>><any>each;
      }
    }
  }.bind(this)());
}

function first<T>(this: Iterable<T>, predicate?: (each: T) => boolean): T | undefined {
  for (const each of this) {
    if (!predicate || predicate(each)) {
      return each;
    }
  }
  return undefined;
}

function toArray<T>(this: Iterable<T>): Array<T> {
  return [...this];
}

function join<T>(this: Iterable<T>, separator: string): string {
  return [...this].join(separator);
}

function bifurcate<T>(this: Iterable<T>, predicate: (each: T) => boolean): Array<Array<T>> {
  const result = [new Array<T>(), new Array<T>()];
  for (const each of this) {
    result[predicate(each) ? 0 : 1].push(each);
  }
  return result;
}

function distinct<T>(this: Iterable<T>, selector?: (each: T) => any): IterableWithLinq<T> {
  const hash = new Dictionary<boolean>();
  return linqify(function* (this: Iterable<T>) {

    if (!selector) {
      selector = i => i;
    }
    for (const each of this) {
      const k = JSON.stringify(selector(each));
      if (!hash[k]) {
        hash[k] = true;
        yield each;
      }
    }
  }.bind(this)());
}