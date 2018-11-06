import { Mapping } from 'source-map';
import { createGraphProxy, JsonPointer, Node, visit, DataHandle } from './main';

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
    /* override this method */
  }

  protected newArrayImpl(pointer: JsonPointer) {
    return { value: createGraphProxy(this.originalFilename, pointer, this.mappings, new Array<any>()), pointer };
  }

  protected newObjectImpl(pointer: JsonPointer) {
    return <any>{ value: createGraphProxy(this.originalFilename, pointer, this.mappings), pointer };
  }

  protected newObject(parent: any, key: string, pointer: string) {
    return parent[key] = this.newObjectImpl(pointer);
  }

  protected newArray(parent: any, key: string, pointer: string) {
    return parent[key] = this.newArrayImpl(pointer);
  }

  protected copy(parent: any, key: string, pointer: string, value: any, recurse: boolean = true) {
    return parent[key] = { value, pointer, recurse };
  }
}
