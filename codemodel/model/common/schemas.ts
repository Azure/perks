import { PrimitiveSchemaTypes, CompoundSchemaTypes } from './schema-type';
import { ObjectSchema, ChoiceSchema, DictionarySchema, ConstantSchema, ArraySchema } from './schema';

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
  primitives?: Array<PrimitiveSchemaTypes | ArraySchema>;
}