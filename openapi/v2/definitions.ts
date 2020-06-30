import { Schema } from './schema';


/**
 * An object to hold data types that can be consumed and produced by operations. These data types can be primitives, arrays or models.
 *
 * Keys are the name for the schema that it defines.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameter-object
 */
export interface Definitions {
  /** a map to a schema definition, mapping a "name" to the schema it defines. */
  [definitionsName: string]: Schema;
}
