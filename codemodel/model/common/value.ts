import { Aspect } from './aspect';
import { Schema } from './schema';
import { DeepPartial } from '@azure-tools/codegen';

/** common base interface for properties, parameters and the like.  */
export interface Value extends Aspect {
  /** the schema of this Value */
  schema: Schema;
  /** if the value is marked 'required'. */
  required?: boolean;
  /** can null be passed in instead  */
  nullable?: boolean;
}

export class Value extends Aspect implements Value {
  constructor(public $key: string, public description: string, schema: Schema, initializer?: DeepPartial<Value>) {
    super($key, description);
    this.schema = schema;
    this.apply(initializer);
  }
}