/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { keys } from '@azure-tools/linq';

export type DeepPartial<T> = {
  [P in keyof T]?:
  T[P] extends Array<infer U> ?                                 // if it is an array
  Array<DeepPartial<U>> :                                       // then use an Array of DeepPartial
  T[P] extends ReadonlyArray<infer V> ?                         // if it's an ReadOnly Array,
  ReadonlyArray<DeepPartial<V>> :                               // use a ReadOnly of DeepPartial
  T[P] extends string | number | boolean | null | undefined ?   // if it's a primitive
  T[P] :                                                        // use that
  DeepPartial<T[P]>                                             // otherwise, it's a DeepPartial of the type.
};

function applyTo(source: any, target: any, cache = new Set<any>()) {
  if (cache.has(source)) {
    throw new Error('Circular refrenced models are not permitted in apply() initializers.');
  }

  for (const i of keys(source)) {
    switch (typeof source[i]) {

      case 'object':

        // merge objects
        if (source[i] != null && source[i] != undefined && typeof target[i] === 'object') {
          cache.add(source);
          applyTo(source[i], target[i], cache);
          cache.delete(source);
          continue;
        }
        // otherwise, just use that object.
        target[i] = source[i];
        continue;


      /* bad idea? : 

      this recursively cloned the contents of the intializer
      but this has the effect of breaking referencs where I wanted 
      them.

      // copy toarray 
      if (Array.isArray(source[i])) {
        cache.add(source);
        applyTo(source[i], target[i] = [], cache);
        cache.delete(source);
        continue;
      }

      // otherwise, copy into an empty object
      cache.add(source);
      applyTo(source[i], target[i] = {}, cache);
      cache.delete(source);
      continue;
    */
      default:
        // everything else just replace.
        target[i] = source[i];
        continue;
    }
  }
}

/** inheriting from Initializer adds an apply<T> method to the class, allowing you to accept an object initalizer, and applying it to the class in the constructor. */
export class Initializer {
  protected apply<T>(...initializer: Array<DeepPartial<T> | undefined>) {
    for (const each of initializer) {
      applyTo(each, this);
    }
  }

  protected applyTo<T>($this: T, ...initializer: Array<DeepPartial<T> | undefined>) {
    for (const each of initializer) {
      applyTo(each, $this);
    }
  }
}
