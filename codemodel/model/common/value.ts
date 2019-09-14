import { Aspect } from './aspect';
import { Schema } from './schema';

/** common base interface for properties, parameters and the like.  */
export interface Value extends Aspect {
  /** the schema of this Value */
  schema: Schema;
  /** if the value is marked 'required'. */
  required?: boolean;
  /** can null be passed in instead  */
  nullable?: boolean;
}
