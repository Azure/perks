import { clone, items, values } from '@microsoft.azure/linq';
import { Mapping } from 'source-map';
import { ProxyObject } from './graph-builder';
import { createGraphProxy, DataHandle, Node, ProxyNode, visit } from './main';

export interface AnyObject {
  [key: string]: any;
  [key: number]: any;
}

type Objects<T> = { [K in keyof T]: T[K] extends object ? K : never }[keyof T];
type ObjectMembers<T> = Pick<T, Objects<T>>;
type Real<T> = T extends null | undefined | never ? never : T;

function isDataHandle(item: any): item is DataHandle {
  return !item.filename;
}

export class MultiProcessor<TInput extends object, TOutput extends object> {
  protected generated: TOutput;
  protected mappings = new Array<Mapping>();
  protected final?: TOutput;
  protected inputs: Array<DataHandle>;

  protected currentInput!: DataHandle;
  protected current!: TInput;
  private targetPointers = new Map<object, string>();

  protected get key(): string {
    if (this.currentInput) {
      return this.currentInput.key;
    }
    // default to the first document if we haven't started processing yet.
    return this.inputs[0].key;
  }

  constructor(inputs: Array<DataHandle>) {
    this.inputs = inputs;

    this.generated = <TOutput>createGraphProxy('', '', this.mappings);
    this.targetPointers.set(this.generated, '');
  }

  public async getOutput(): Promise<TOutput> {
    await this.runProcess();
    return <TOutput>this.final;
  }

  public async getSourceMappings(): Promise<Array<Mapping>> {
    await this.runProcess();
    return this.mappings;
  }
  /*
    public get output(): Promise<TOutput> {
      return this.runProcess().then(() => <TOutput>this.mappings);
    }

    public get sourceMappings(): Promise<Array<Mapping>> {
      return this.runProcess().then(() => this.mappings);
    }
  */
  private async runProcess() {
    if (!this.final) {
      await this.init();
      for (this.currentInput of values(this.inputs)) {
        this.current = this.currentInput.ReadObject<TInput>();
        await this.process(this.generated, visit(this.current));
      }
      await this.finish();
    }
    this.final = clone(this.generated);  // should we be freezing this?
  }

  // public process(input: string, parent: ProxyObject<TOutput>, nodes: Iterable<NodeT<TInput, keyof TInput>>) {
  public async process(target: ProxyObject<TOutput>, nodes: Iterable<Node>) {
    /* override this method */
  }

  public async init() {
    /* override this method */
  }

  public async finish() {
    /* override this method */
  }

  public getOrCreateObject<TParent extends object, K extends keyof TParent>(target: ProxyObject<TParent>, member: K, pointer: string) {
    return target[member] === undefined ? this.newObject(target, member, pointer) : target[member];
  }

  public getOrCreateArray<TParent extends object, K extends keyof TParent>(target: ProxyObject<TParent>, member: K, pointer: string) {
    return target[member] === undefined ? this.newArray(target, member, pointer) : target[member];
  }

  public newObject<TParent extends object, K extends keyof TParent>(target: ProxyObject<TParent>, member: K, pointer: string): AnyObject {

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
    // return target[member] = <ProxyNode<TParent[K]>>{ value: JSON.parse(JSON.stringify(value)), pointer, recurse, filename: this.key };
    return target[member] = <ProxyNode<TParent[K]>>{ value: clone(value), pointer, recurse, filename: this.key };
  }
}

export class Processor<TInput extends object, TOutput extends object> extends MultiProcessor<TInput, TOutput> {
  constructor(originalFile: DataHandle) {
    super([originalFile]);
  }
}

export function typeOf(obj: any) {
  const t = typeof (obj);
  return t === 'object' ?
    Array.isArray(obj) ?
      'array' :
      'object' :
    t;
}

export class SimpleProcessor extends Processor<AnyObject, AnyObject> {
  async process(target: AnyObject, originalNodes: Iterable<Node>) {
    for (const { value, key, pointer, children } of originalNodes) {
      if (!await this.visitLeaf(target, value, key, pointer, children)) {
        await this.defaultCopy(target, value, key, pointer, children);
      }
    }
  }

  async visitLeaf(target: AnyObject, value: AnyObject, key: string, pointer: string, originalNodes: Iterable<Node>): Promise<boolean> {
    return false;
  }

  async defaultCopy(target: AnyObject, ivalue: AnyObject, ikey: string, ipointer: string, originalNodes: Iterable<Node>) {
    switch (typeOf(ivalue)) {
      case 'object':
        // objects recurse
        const newTarget = this.newObject(target, ikey, ipointer);
        for (const { value, key, pointer, children } of originalNodes) {
          if (!await this.visitLeaf(newTarget, value, key, pointer, children)) {
            await this.defaultCopy(newTarget, value, key, pointer, children);
          }
        }
        break;

      default:
        /// console.error(`Cloning ${ipointer}`);
        // everything else, just clone.
        this.clone(target, ikey, ipointer, ivalue);
    }
  }
}