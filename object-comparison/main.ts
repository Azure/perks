/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

function isPrimitive(object: any) {
  switch (typeof object) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
      return true;
    default:
      return false;
  }
}
function _areSimilar(a: any, b: any, exceptionListSet: Set<string>): boolean {
  // 100% similar things, including primitives
  if (a === b) {
    return true;
  }

  // typeof null is object, but if both were null that would have been already detected.
  if (
    a === null || b === null ||  // either is null?
    isPrimitive(a) || isPrimitive(b) || // either is primitive
    typeof a !== typeof b || // types not the same?
    (Array.isArray(a) && !Array.isArray(b)) ||  // one an array and not the other?
    (!Array.isArray(a) && Array.isArray(b))) {
    return false;
  }


  // Object similarity is determined by the same set of keys NOT in
  // the exception list (although not necessarily the same order), and equivalent values for every
  // corresponding key NOT in the exception list.

  // the same set of keys, but not neccesarily same order
  const keysA = Object.keys(a).filter(each => !exceptionListSet.has(each)).sort();
  const keysB = Object.keys(b).filter(each => !exceptionListSet.has(each)).sort();

  if (keysA.length !== keysB.length) {
    return false;
  }

  // key test
  for (let i = keysA.length - 1; i >= 0; i--) {
    if (keysA[i] !== keysB[i]) {
      return false;
    }
  }

  // value test 
  return !(keysA.find(key => !_areSimilar(a[key], b[key], exceptionListSet)));
}

export function areSimilar(a: any, b: any, ...exceptionList: Array<string>): boolean {
  return _areSimilar(a, b, new Set(exceptionList));
}
