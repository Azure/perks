import { ObjectSchema, ChoiceSchema, DictionarySchema, ConstantSchema, ArraySchema, AndSchema, OrSchema, XorSchema, BooleanSchema, NumberSchema, StringSchema, DateSchema, DateTimeSchema, UnixTimeSchema, CredentialSchema, UriSchema, UuidSchema, DurationSchema, CharSchema, ByteArraySchema, ParameterGroupSchema, NotSchema, SealedChoiceSchema, FlagSchema } from './schema';
import { Parameter } from './parameter';

/** the full set of schemas for a given service, categorized into convenient collections */
export interface Schemas {
  /** schemas that likely result in the creation of new objects during code generation */
  objects?: Array<ObjectSchema>;

  /** groups of parameters that can be built as an object */
  parameterGroups?: Array<ParameterGroupSchema>;

  /** schemas that construct more complex schemas based on compound construction (ie, allOf, oneOf, anyOf) */
  orCompounds?: Array<OrSchema>;
  andCompounds?: Array<AndSchema>;
  xorCompounds?: Array<XorSchema>;

  /** schemas that represent a set of choices (ie, 'enum') */
  choices?: Array<ChoiceSchema>;

  /** schemas that represent a set of choices that are sealed -- that can never have items added to the definition. */
  sealedChoices?: Array<SealedChoiceSchema>;

  flags?: Array<FlagSchema>;

  /** schemas that represent key-value dictionaries used in the model. */
  dictionaries?: Array<DictionarySchema>;

  /** constant values that are used in models and parameters */
  constants?: Array<ConstantSchema>;

  /** primitive schemas that represent things that should be able to be represented without additional classes generated
   * 
   * @note - the important bits in these are the validation restrictions that may be present.
   */
  primitives?: Array<PrimitiveSchemas | ValueSchemas>;

}

export type CompoundSchemas =
  AndSchema |
  OrSchema |
  XorSchema;

/** Schema types that are primitive language values */
export type PrimitiveSchemas =
  BooleanSchema |
  DateSchema |
  DateTimeSchema |
  UnixTimeSchema |
  CredentialSchema |
  UriSchema |
  UuidSchema |
  DurationSchema |
  CharSchema |
  NumberSchema |
  StringSchema;

/** schema types that are non-object or complex types */
export type ValueSchemas =
  ByteArraySchema |
  PrimitiveSchemas |
  ArraySchema |
  ChoiceSchema | SealedChoiceSchema | FlagSchema;

/** schema types that can be objects */
export type ObjectSchemas =
  AndSchema |
  OrSchema |
  DictionarySchema |
  ObjectSchema;

/** all schema types */
export type AllSchemas =
  ValueSchemas | ObjectSchemas | ConstantSchema | NotSchema | ParameterGroupSchema;

export class Schemas {

  addPrimitive<T extends ValueSchemas>(schema: T): T {
    this.primitives || (this.primitives = new Array<ValueSchemas>()).push(schema);
    return schema;
  }
  addObject<T extends ObjectSchema>(schema: T): T {
    (this.objects || (this.objects = new Array<ObjectSchema>())).push(schema);
    return schema;
  }
  addParameterGroup<T extends ParameterGroupSchema>(schema: T): T {
    (this.parameterGroups || (this.parameterGroups = new Array<ParameterGroupSchema>())).push(schema);
    return schema;
  }
  addOrSchema<T extends OrSchema>(schema: T): T {
    (this.orCompounds || (this.orCompounds = new Array<OrSchema>())).push(schema);
    return schema;
  }
  addAndSchema<T extends AndSchema>(schema: T): T {
    (this.andCompounds || (this.andCompounds = new Array<AndSchema>())).push(schema);
    return schema;
  }
  addXorSchema<T extends XorSchema>(schema: T): T {
    (this.xorCompounds || (this.xorCompounds = new Array<XorSchema>())).push(schema);
    return schema;
  }
  addChoice<T extends ChoiceSchema>(schema: T): T {
    (this.choices || (this.choices = new Array<ChoiceSchema>())).push(schema);
    return schema;
  }
  addFlag<T extends FlagSchema>(schema: T): T {
    (this.flags || (this.flags = new Array<FlagSchema>())).push(schema);
    return schema;
  }
  addSealedChoice<T extends SealedChoiceSchema>(schema: T): T {
    (this.sealedChoices || (this.sealedChoices = new Array<SealedChoiceSchema>())).push(schema);
    return schema;
  }
  addDictionary<T extends DictionarySchema>(schema: T): T {
    (this.dictionaries || (this.dictionaries = new Array<DictionarySchema>())).push(schema);
    return schema;
  }
  addConstant<T extends ConstantSchema>(schema: T): T {
    (this.constants || (this.constants = new Array<ConstantSchema>())).push(schema);
    return schema;
  }
}