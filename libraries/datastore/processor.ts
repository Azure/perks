import { items } from '@microsoft.azure/linq';

import { Mapping } from 'source-map';
import { createGraphProxy, DataHandle, ProxyNode, Node, visit } from './main';
import { ProxyObject } from './graph-builder';
import { finished } from 'stream';


export interface AnyObject {
  [key: string]: any;
  [key: number]: any;
}

type Objects<T> = { [K in keyof T]: T[K] extends object ? K : never }[keyof T];
type ObjectMembers<T> = Pick<T, Objects<T>>;
type Real<T> = T extends null | undefined | never ? never : T;
/*
export class Processor<TInput, TOutput> {
  protected generated: any;
  protected mappings = new Array<Mapping>();
  protected hasRun = false;
  protected originalFilename: string;
  protected original: TInput;

  constructor(originalFile: DataHandle);
  constructor(originalFile: string, original: TInput)

  constructor(originalFile: string | DataHandle, original?: TInput) {
    if (typeof originalFile === 'string') {
      this.originalFilename = originalFile;
      this.original = original || <any>{};
    } else {
      this.originalFilename = originalFile.key;
      this.original = originalFile.ReadObject<TInput>();
    }

    this.generated = createGraphProxy(this.originalFilename, '', this.mappings);
  }

  public get output(): TOutput {
    this.runProcess();
    return <TOutput>this.generated;
  }

  public get sourceMappings(): Array<Mapping> {
    this.runProcess();
    return this.mappings;
  }
  private runProcess() {
    if (!this.hasRun) {
      this.process(this.generated, visit(this.original));
    }
    return this.hasRun = true;
  }
  public process(parent: any, nodes: Iterable<Node>) {
    /* override this method * /
  }

  protected newObject(parent: any, key: string, pointer: string) {
    const result = { value: createGraphProxy(this.originalFilename, pointer, this.mappings), pointer };
    parent[key] = result;
    return result.value;
  }

  protected newArray(parent: any, key: string, pointer: string) {
    const result = { value: createGraphProxy(this.originalFilename, pointer, this.mappings, new Array<any>()), pointer };
    parent[key] = result;
    return result.value;
  }

  protected copy(parent: any, key: string, pointer: string, value: any, recurse: boolean = true) {
    return parent[key] = { value, pointer, recurse };
  }
}
*/

function isDataHandle(item: any): item is DataHandle {
  return !item.filename;
}

export class MultiProcessor<TInput extends object, TOutput extends object> {
  protected generated: TOutput;
  protected mappings = new Array<Mapping>();
  protected hasRun = false;
  protected original = new Map<string, TInput>();
  protected key!: string;
  protected current!: TInput;
  private targetPointers = new Map<object, string>();

  constructor(input: Array<{ filename: string, data: TInput }> | Array<DataHandle>) {
    for (const i of input) {
      if (isDataHandle(i)) {
        this.original.set(i.key, i.ReadObject<TInput>());
      } else {
        this.original.set(i.filename, i.data);
      }
    }
    this.generated = <TOutput>createGraphProxy('', '', this.mappings);
    this.targetPointers.set(this.generated, '');
  }

  public get output(): TOutput {
    this.runProcess();
    return <TOutput>this.generated;
  }

  public get sourceMappings(): Array<Mapping> {
    this.runProcess();
    return this.mappings;
  }

  private runProcess() {
    if (!this.hasRun) {
      this.init();
      for (const { key, value } of items(this.original)) {
        this.key = key;
        this.current = value;
        this.process(this.generated, visit(value));
      }
      this.finish();
    }
    return this.hasRun = true;
  }

  // public process(input: string, parent: ProxyObject<TOutput>, nodes: Iterable<NodeT<TInput, keyof TInput>>) {
  public process(target: ProxyObject<TOutput>, nodes: Iterable<Node>) {
    /* override this method */
  }

  public init() {
    /* override this method */
  }

  public finish() {
    /* override this method */
  }

  public newObject<TParent extends object, K extends keyof TParent>(target: ProxyObject<TParent>, member: K, pointer: string) {

    const value = <ProxyObject<TParent[K]>><any>createGraphProxy(this.key, `${this.targetPointers.get(target)}/${member}`, this.mappings);
    this.targetPointers.set(value, `${this.targetPointers.get(target)}/${member}`);
    target[member] = {
      value: <TParent[typeof member]>value,
      filename: this.key,
      pointer
    };

    return <Real<TParent[K]>>value;
  }

  public newArray<TParent extends object, K extends keyof TParent>(target: ProxyObject<TParent>, member: K, pointer: string) {
    const value = <ProxyObject<TParent[K]>><any>createGraphProxy(this.key, `${this.targetPointers.get(target)}/${member}`, this.mappings, new Array<any>());
    this.targetPointers.set(value, `${this.targetPointers.get(target)}/${member}`);
    target[member] = {
      value: <TParent[typeof member]>value,
      filename: this.key,
      pointer
    };

    return <Real<TParent[K]>>value;
  }

  protected copy<TParent extends object, K extends keyof TParent>(target: ProxyObject<TParent>, member: K, pointer: string, value: TParent[K], recurse: boolean = true) {
    return target[member] = <ProxyNode<TParent[K]>>{ value, pointer, recurse, filename: this.key };
  }
  protected clone<TParent extends object, K extends keyof TParent>(target: ProxyObject<TParent>, member: K, pointer: string, value: TParent[K], recurse: boolean = true) {
    return target[member] = <ProxyNode<TParent[K]>>{ value: JSON.parse(JSON.stringify(value)), pointer, recurse, filename: this.key };
  }
}

export class Processor<TInput extends object, TOutput extends object> extends MultiProcessor<TInput, TOutput> {
  constructor(originalFile: DataHandle);
  constructor(originalFile: string, original: TInput)

  constructor(originalFile: string | DataHandle, original?: TInput) {
    if (typeof originalFile === 'string') {
      super([{ filename: originalFile, data: original || <any>{} }]);
    } else {
      super([originalFile]);
    }
  }
}


/*

interface aaa {
  age: number;
}

class source {
  [key: string]: any;
  a: number = 0;
  b: string = "";
  c: object = {};
  kids = new Array<string>();
}

class target {
  aye: number = -1;
  bee: string = "";
  c: aaa = {
    age: 0
  }
  children = new Array<string>();

}


class Test extends MultiProcessor<source, target> {
  public process( parent: ProxyObject<target>, nodes: Iterable<Node>) {
    const q = this.newObject(parent,, '');
    q.age = { value: 100, pointer: "" };
    const x = this.newArray("file0", parent, "children", '');
for( const {key, value, pointer, children} of nodes) {
    key
}
  }
}

*/