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
    return this.currentInput.key;
  }

  constructor(inputs: Array<DataHandle>) {
    this.inputs = inputs;

    this.generated = <TOutput>createGraphProxy('', '', this.mappings);
    this.targetPointers.set(this.generated, '');
  }

  public get output(): TOutput {
    this.runProcess();
    return <TOutput>this.final;
  }

  public get sourceMappings(): Array<Mapping> {
    this.runProcess();
    return this.mappings;
  }

  private runProcess() {
    if (!this.final) {
      this.init();
      for (const input of values(this.inputs)) {
        this.currentInput = input;
        this.current = input.ReadObject<TInput>();
        this.process(this.generated, visit(this.current));
      }
      this.finish();
    }
    this.final = clone(this.generated);  // should we be freezing this?
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
  constructor(originalFile: DataHandle) {
    super([originalFile]);
  }
}