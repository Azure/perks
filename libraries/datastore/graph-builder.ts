import { Mapping } from 'source-map';
import { JsonPointer, Node, visit, parsePointer } from './json-pointer';
import { CreateAssignmentMapping } from './source-map/source-map';
import { Exception } from '@microsoft.azure/tasks';

export function createGraphProxy<T extends object>(originalFileName: string, targetPointer: JsonPointer = '', mappings = new Array<Mapping>(), instance = <any>{}): ProxyObject<T> {

  const tag = (value: any, filename: string | undefined, pointer: string, key: string | number, subject: string | undefined, recurse: boolean) => {
    CreateAssignmentMapping(value, filename || originalFileName, parsePointer(pointer), [...parsePointer(targetPointer), key].filter(each => each !== ''), subject || '', recurse, mappings);
  };

  const push = (value: any) => {
    instance.push(value.value);
    tag(value.value, value.filename, value.pointer, instance.length - 1, value.subject, value.recurse);
  };

  return new Proxy<ProxyObject<T>>(instance, {
    get(target: ProxyObject<T>, key: string | number | symbol): any {
      if (key === '__push__') {
        return push;
      }
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
      if (instance[key]) {
        throw new Exception("")
      }

      instance[key] = value.value;
      tag(value.value, value.filename, value.pointer, key, value.subject, value.recurse);

      return true;
    },
  });
}

interface ProxyNode<T> {
  value: T;
  pointer: string;
  filename?: string;
  subject?: string;
  recurse: boolean;
}

export type ProxyObject<TG> = ProxyNode<TG> & {
  [P in keyof TG]: ProxyObject<TG[P]> | ProxyNode<TG[P]>;
};
