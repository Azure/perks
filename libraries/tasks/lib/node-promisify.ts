import { promisify as utilPromisify } from 'util';
import { TypeException } from './exception';
import { ManualPromise } from './manual-promise';

const kCustomPromisifiedSymbol = Symbol('util.promisify.custom');
const kCustomPromisifyArgsSymbol = Symbol('customPromisifyArgs');

declare global {
  interface ObjectConstructor {
    getOwnPropertyDescriptors(o: any): PropertyDescriptorMap;
  }
}
/* eslint-disable */
/**
 * Add polyfill for Object.getOwnPropertyDescriptors
 *
 * Origin: https://github.com/tc39/proposal-object-getownpropertydescriptors
 */
if (!Object.hasOwnProperty('getOwnPropertyDescriptors')) {
  Object.defineProperty(
    Object,
    'getOwnPropertyDescriptors',
    {
      configurable: true,
      writable: true,
      value: function getOwnPropertyDescriptors(object: any) {
        return Reflect.ownKeys(object).reduce((descriptors, key) => {
          return Object.defineProperty(
            descriptors,
            key,
            {
              configurable: true,
              enumerable: true,
              writable: true,
              value: Object.getOwnPropertyDescriptor(object, key)
            }
          );
        }, {});
      }
    }
  );
}

/**
 * Promisify Implementation acquired from node8 and adapted to node7/typescript
 *
 * @param original original method declaration
 */
function _promisify(original: any) {
  if (typeof original !== 'function') {
    throw new TypeException('ERR_INVALID_ARG_TYPE', 'original', 'Function');
  }

  if (original[kCustomPromisifiedSymbol]) {
    const fn = original[kCustomPromisifiedSymbol];

    if (typeof fn !== 'function') {
      throw new TypeException('ERR_INVALID_ARG_TYPE',
        'util.promisify.custom',
        'Function',
        fn);
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  // Names to create an object from in case the callback receives multiple
  // arguments, e.g. ['stdout', 'stderr'] for child_process.exec.
  const argumentNames = original[kCustomPromisifyArgsSymbol];

  function fn(this: any, ...args: Array<any>): Promise<any> {
    const promise = new ManualPromise();
    try {
      original.call(this, ...args, (err: any, ...values: Array<any>) => {
        if (err) {
          promise.reject(err);
        } else if (argumentNames !== undefined && values.length > 1) {
          const obj: any = {};
          for (let i = 0; i < argumentNames.length; i++) {
            obj[argumentNames[i]] = values[i];
          }
          promise.resolve(obj);
        } else {
          promise.resolve(values[0]);
        }
      });
    } catch (err) {
      promise.reject(err);
    }
    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    Object.getOwnPropertyDescriptors(original)
  );
}

(<any>_promisify).custom = kCustomPromisifiedSymbol;

/**
 * Promisify implementation, will use built-in version in node if available, falls back to local implementation borrowed from node8.
 */
export const promisify = utilPromisify || _promisify;
