import { PrimitiveSchemaTypes, CompoundSchemaTypes } from './schema-type';
import { ObjectSchema, ChoiceSchema, DictionarySchema, ConstantSchema, ArraySchema, AndSchema, OrSchema, XorSchema, BooleanSchema, NumberSchema, StringSchema } from './schema';

/** the full set of schemas for a given service, categorized into convenient collections */
export interface Schemas {
  /** schemas that likely result in the creation of new objects during code generation */
  objects?: Array<ObjectSchema>;

  /** schemas that construct more complex schemas based on compound construction (ie, allOf, oneOf, anyOf) */
  compounds?: Array<CompoundSchemaTypes>;

  /** schemas that represent a set of choices (ie, 'enum') */
  choices?: Array<ChoiceSchema>;

  /** schemas that represent key-value dictionaries used in the model. */
  dictionaries?: Array<DictionarySchema>;

  /** constant values that are used in models and parameters */
  constants?: Array<ConstantSchema>;

  /** primitive schemas that represent things that should be able to be represented without additional classes generated
   * 
   * @note - the important bits in these are the validation restrictions that may be present.
   */
  primitives?: Array<PrimitiveSchemas>;
}

export type CompoundSchemas =
  AndSchema |
  OrSchema |
  XorSchema;

/** Schema types that are primitive language values */
export type PrimitiveSchemas =
  BooleanSchema |
  NumberSchema |
  StringSchema |
  ArraySchema;

/** schema types that are non-object or complex types */
export type ValueSchemas =
  PrimitiveSchemas |
  ArraySchema |
  ChoiceSchema;

/** schema types that can be objects */
export type ObjectSchemas =
  AndSchema |
  OrSchema |
  DictionarySchema |
  ObjectSchema;

/** all schema types */
export type AllSchemas =
  ValueSchemas | ObjectSchemas | ConstantSchema;

export class Schemas {

  addPrimitive<T extends PrimitiveSchemas>(schema: T): T {
    this.primitives || (this.primitives = new Array<PrimitiveSchemas>()).push(schema);
    return schema;
  }
}