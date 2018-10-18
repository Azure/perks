import { Mapping } from 'source-map';
import { JsonPointer, Node, visit } from './json-pointer';

import { any, keys, length } from '@microsoft.azure/linq';
import { create } from 'domain';
import { paths, parseJsonPointer } from './jsonpath';
import { CreateAssignmentMapping } from './source-map/source-map';

export function createGraphProxy<T extends object>(originalFileName: string, targetPointer: JsonPointer = '', mappings = new Array<Mapping>()): ProxyObject<T> {
  const instance = <any>{
    //____hasSourceGraph: true
  };

  return new Proxy<ProxyObject<T>>(instance, {
    get(target: ProxyObject<T>, key: string | number | symbol): any {
      return (instance)[key];
    },

    set(target: ProxyObject<T>, key: string | number, value: ProxyNode<any>): boolean {
      // check if this is a correct assignment.
      if (value.value === undefined) {
        throw new Error('Assignment: Direct Assignment Prohibited.');
      }
      if (value.pointer === undefined) {
        throw new Error('Assignment: pointer property required.');
      }
      if (typeof (value.value) === 'object' && !Array.isArray(value.value)) {
        /*        if (!(instance).____hasSourceGraph) {
                  throw new Error('Assignment: Objects must have source graph.');
                }
        */
      }
      instance[key] = value.value;

      CreateAssignmentMapping(value.value, value.filename || originalFileName, parseJsonPointer(value.pointer), [targetPointer, key], value.subject || '', false, mappings);
      // set the value in the target object

      return true;
    }
  });
}

interface ProxyNode<T> {
  value: T;
  pointer: string;
  filename?: string;
  subject?: string;
}

export type ProxyObject<TG> = ProxyNode<TG> & {
  [P in keyof TG]: ProxyObject<TG[P]> | ProxyNode<TG[P]>;
};
