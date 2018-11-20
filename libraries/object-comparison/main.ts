/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function areSimilar(a: any, b: any, exceptionList: Array<string> = []): boolean {
  // identical values that can be tested by  ===
  if (a === b) {
    return true;

    // Arrays and object similaritys is determined by the same set of keys NOT in 
    // the exception list (although not necessarily the same order), and equivalent values for every
    // corresponding key NOT in the exception list.
  } else {

    const exceptionListSet = new Set(exceptionList);
    const setKeysA = new Set(Object.keys(a));
    const setKeysB = new Set(Object.keys(b));

    // make sure that exception list key are included
    // so it does not fail in the following steps.
    for (const key of exceptionList) {
      setKeysA.add(key);
      setKeysB.add(key);
    }

    // after adding all the keys from the exception list they
    // should have the same number of keys
    if (setKeysA.size != setKeysB.size) {
      return false;
    }

    const keysA = Array.from(setKeysA);
    const keysB = Array.from(setKeysB);

    // the same set of keys, but not neccesarily same order
    keysA.sort();
    keysB.sort();

    // key test
    for (let i = keysA.length - 1; i >= 0; i--) {
      if (keysA[i] !== keysB[i]) {
        return false;
      }
    }
    for (let i = keysA.length - 1; i >= 0; i--) {
      const key = keysA[i];
      // just compare if not in the exception list.
      if (!exceptionListSet.has(key)) {
        if (!areSimilar(a[key], b[key], exceptionList)) {
          return false
        }
      }
    }

    return typeof a === typeof b;
  }
}

