import { Language, Protocol, Metadata } from './metadata';
import { Aspect } from './aspect';
import { SerializationFormats } from './formats';
import { SchemaType, AllSchemaTypes, PrimitiveSchemaTypes, ObjectSchemaTypes } from './schema-type';
import { Discriminator } from './discriminator';
import { DeepPartial, Initializer, } from '@azure-tools/codegen';
import { Property } from './property';
import { Dictionary } from '@azure-tools/linq';
import { Extensions } from './extensions';
import { Languages } from './languages';
import { Parameter } from './parameter';

export interface SerializationFormat extends Extensions, Dictionary<any> {

}

/** The Schema Object allows the definition of input and output data types. */
export interface Schema extends Aspect {
  /** per-language information for Schema */
  language: Languages;

  /** the schema type  */
  type: AllSchemaTypes;

  /* short description */
  summary?: string;

  /** example information  */
  example?: any;

  /** If the value isn't sent on the wire, the service will assume this */
  defaultValue?: any;

  /** per-serialization information for this Schema  */
  serialization: SerializationFormats;

  /* are these needed I don't think so? */
  // nullable: boolean;
  // readOnly: boolean;
  // writeOnly: boolean;
}

export class Schema extends Aspect implements Schema {
  type: AllSchemaTypes;

  constructor(schemaName: string, description: string, type: AllSchemaTypes, initializer?: DeepPartial<Schema>) {
    super(schemaName, description);
    this.type = type;

    // this.allOf = (this.allOf || [] ).push( schema );
    this.apply({
      language: {
        default: {
        }
      },
      protocol: {
      }
    }, initializer);
  }
}

/** schema types that are non-object or complex types */
export interface ValueSchema extends Schema {

}

/** Schema types that are primitive language values */
export interface PrimitiveSchema extends ValueSchema {

}

/** schema types that can be objects */
export interface ComplexSchema extends Schema {

}

/** returns true if the given schema is a NumberSchema */
export function isNumberSchema(schema: Schema): schema is NumberSchema {
  return schema.type === SchemaType.Number || schema.type === SchemaType.Integer;
}

/** a Schema that represents a Number value */
export interface NumberSchema extends PrimitiveSchema {

  /** the schema type  */
  type: SchemaType.Number | SchemaType.Integer;

  /** precision (# of bits?) of the number */
  precision: number;

  /** if present, the number must be an exact multiple of this value */
  multipleOf?: number;

  /** if present, the value must be lower than or equal to this (unless exclusiveMaximum is true)  */
  maximum?: number;

  /** if present, the value must be lower than maximum   */
  exclusiveMaximum?: boolean;

  /** if present, the value must be highter than or equal to this (unless exclusiveMinimum is true)  */
  minimum?: number;

  /** if present, the value must be higher than minimum   */
  exclusiveMinimum?: boolean;
}

export class NumberSchema extends Schema implements NumberSchema {
  constructor(name: string, description: string, type: SchemaType.Number | SchemaType.Integer, precision: number, objectInitializer?: DeepPartial<NumberSchema>) {
    super(name, description, type);
    this.apply({ precision }, objectInitializer);
  }
}

/** a Schema that represents a string value */
export interface StringSchema extends PrimitiveSchema {

  /** the schema type  */
  type: SchemaType.String;

  /** the maximum length of the string */
  maxLength?: number;

  /** the minimum length of the string */
  minLength?: number;

  /** a regular expression that the string must be validated against */
  pattern?: string; // regex
}

export class StringSchema extends Schema implements StringSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<StringSchema>) {
    super(name, description, SchemaType.String);
    this.apply(objectInitializer);
  }
}

/** a Schema that represents and array of values */
export interface ArraySchema<ElementType extends Schema = Schema> extends ValueSchema {
  /** the schema type  */
  type: SchemaType.Array;

  /** elementType of the array */
  elementType: ElementType;

  /** maximum number of elements in the array */
  maxItems?: number;

  /** minimum number of elements in the array */
  minItems?: number;

  /** if the elements in the array should be unique */
  uniqueItems?: boolean;
}
export class ArraySchema<ElementType extends Schema = Schema> extends Schema implements ArraySchema<ElementType>{
  constructor(name: string, description: string, elementType: ElementType, objectInitializer?: DeepPartial<ArraySchema<ElementType>>) {
    super(name, description, SchemaType.Array);
    this.elementType = elementType;

    this.apply(objectInitializer);
  }
}

/** a schema that represents a set of parameters. */
export interface ParameterGroupSchema extends ComplexSchema {
  /** the schema type  */
  type: SchemaType.ParameterGroup;

  /** the collection of properties that are in this object */
  parameters: Array<Parameter>;
}

export class ParameterGroupSchema extends Schema implements ParameterGroupSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ObjectSchema>) {
    super(name, description, SchemaType.Object);
    this.apply(objectInitializer);
  }

  addParameter(parameter: Parameter) {
    (this.parameters = this.parameters || []).push(parameter);
    return parameter;
  }
}


/** a schema that represents a type with child properties. */
export interface ObjectSchema extends ComplexSchema {
  /** the schema type  */
  type: SchemaType.Object;

  /** the definition of the polymorphic descriminator for this type */
  discriminator?: Discriminator;

  /** the collection of properties that are in this object */
  properties?: Array<Property>;

  /**  maximum number of properties permitted */
  maxProperties?: number;

  /**  minimum number of properties permitted */
  minProperties?: number;
}

export class ObjectSchema extends Schema implements ObjectSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ObjectSchema>) {
    super(name, description, SchemaType.Object);
    this.apply(objectInitializer);
  }

  addProperty(property: Property) {
    (this.properties = this.properties || []).push(property);
    return property;
  }
}


/** an individual choice in a ChoiceSchema */
export interface ChoiceValue extends Extensions {
  /** per-language information for this value */
  language: Languages;

  /** the actual value  */
  value: string | number | boolean;
}

export class ChoiceValue extends Initializer {
  constructor(name: string, description: string, value: string | number | boolean, objectInitializer?: DeepPartial<ChoiceValue>) {
    super();
    this.value = value;
    this.language = {
      default: {
        name,
        description
      }
    };
    this.apply(objectInitializer);
  }
}

/** a schema that represents a choice of several values (ie, an 'enum') */
export interface ChoiceSchema<ChoiceType extends PrimitiveSchema = StringSchema> extends ValueSchema {
  /** the schema type  */
  type: SchemaType.Choice;

  /** the primitive type for the choices */
  choiceType: ChoiceType;

  /** the possible choices for in the set */
  choices: Array<ChoiceValue>;
}

export class ChoiceSchema<ChoiceType extends PrimitiveSchema = StringSchema> extends Schema implements ChoiceSchema<ChoiceType>{
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ChoiceSchema<ChoiceType>>) {
    super(name, description, SchemaType.Choice);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a choice of several values (ie, an 'enum') */
export interface SealedChoiceSchema<ChoiceType extends PrimitiveSchema = StringSchema> extends ValueSchema {
  /** the schema type  */
  type: SchemaType.SealedChoice;

  /** the primitive type for the choices */
  choiceType: ChoiceType;

  /** the possible choices for in the set */
  choices: Array<ChoiceValue>;
}

export class SealedChoiceSchema<ChoiceType extends PrimitiveSchema = StringSchema> extends Schema implements SealedChoiceSchema<ChoiceType>{
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ChoiceSchema<ChoiceType>>) {
    super(name, description, SchemaType.SealedChoice);
    this.apply(objectInitializer);
  }
}

export interface FlagValue extends Extensions {
  /** per-language information for this value */
  language: Languages;

  value: number;
}

export class FlagValue extends Initializer implements FlagValue {
  constructor(name: string, description: string, value: number, objectInitializer?: DeepPartial<FlagValue>) {
    super();
    this.value = value;
    this.language.default = {
      name,
      description
    };
    this.apply(objectInitializer);
  }
}

export interface FlagSchema extends ValueSchema {
  /** the possible choices for in the set */
  choices: Array<FlagValue>;

}

export class FlagSchema extends Schema implements FlagSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<FlagSchema>) {
    super(name, description, SchemaType.Flag);
    this.apply(objectInitializer);
  }
}

/** a container for the actual constant value */
export interface ConstantValue extends Extensions {
  /** per-language information for this value */
  language: Languages;

  /** the actual constant value to use */
  value: any;
}

export class ConstantValue extends Initializer implements ConstantValue {
  constructor(name: string, description: string, value: any, objectInitializer?: DeepPartial<ConstantValue>) {
    super();
    this.value = value;
    this.language.default = {
      name,
      description
    };
    this.apply(objectInitializer);
  }
}

/** a schema that represents a constant value */
export interface ConstantSchema<ConstantType extends Schema = Schema> extends Schema {
  /** the schema type  */
  type: SchemaType.Constant;

  /** the schema type of the constant value (ie, StringSchema, NumberSchema, etc) */
  constantSchema: ConstantType;

  /** the actual constant value */
  value: ConstantValue;
}

export class ConstantSchema<ConstantType extends Schema = Schema> extends Schema implements ConstantSchema<ConstantType>{
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ConstantSchema<ConstantType>>) {
    super(name, description, SchemaType.Constant);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a boolean value */
export interface BooleanSchema extends PrimitiveSchema {
  /** the schema type  */
  type: SchemaType.Boolean;

}

export class BooleanSchema extends Schema implements BooleanSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<BooleanSchema>) {
    super(name, description, SchemaType.Boolean);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a ODataQuery value */
export interface ODataQuerySchema extends Schema {
  /** the schema type  */
  type: SchemaType.ODataQuery;

}

export class ODataQuerySchema extends Schema implements ODataQuerySchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ODataQuerySchema>) {
    super(name, description, SchemaType.ODataQuery);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a Credential value */
export interface CredentialSchema extends PrimitiveSchema {
  /** the schema type  */
  type: SchemaType.Credential;

  /** the maximum length of the string */
  maxLength?: number;

  /** the minimum length of the string */
  minLength?: number;

  /** a regular expression that the string must be validated against */
  pattern?: string; // regex
}

export class CredentialSchema extends Schema implements CredentialSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<CredentialSchema>) {
    super(name, description, SchemaType.Credential);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a Uri value */
export interface UriSchema extends PrimitiveSchema {
  /** the schema type  */
  type: SchemaType.Uri;

  /** the maximum length of the string */
  maxLength?: number;

  /** the minimum length of the string */
  minLength?: number;

  /** a regular expression that the string must be validated against */
  pattern?: string; // regex
}

export class UriSchema extends Schema implements UriSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<UriSchema>) {
    super(name, description, SchemaType.Uri);
    this.apply(objectInitializer);
  }
}
/** a schema that represents a Uuid value */
export interface UuidSchema extends PrimitiveSchema {
  /** the schema type  */
  type: SchemaType.Uuid;
}

export class UuidSchema extends Schema implements UuidSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<UuidSchema>) {
    super(name, description, SchemaType.Uuid);
    this.apply(objectInitializer);
  }
}
/** a schema that represents a Duration value */
export interface DurationSchema extends PrimitiveSchema {
  /** the schema type  */
  type: SchemaType.Duration;
}

export class DurationSchema extends Schema implements DurationSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<DurationSchema>) {
    super(name, description, SchemaType.Duration);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a DateTime value */
export interface DateTimeSchema extends PrimitiveSchema {
  /** the schema type  */
  type: SchemaType.DateTime;

  /** date-time format  */
  format: 'date-time-rfc1123' | 'date-time';
}

export class DateTimeSchema extends Schema implements DateTimeSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<DateTimeSchema>) {
    super(name, description, SchemaType.DateTime);
    this.apply(objectInitializer);
  }
}
/** a schema that represents a Date value */
export interface DateSchema extends PrimitiveSchema {
  /** the schema type  */
  type: SchemaType.Date;
}

export class DateSchema extends Schema implements DateSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<DateSchema>) {
    super(name, description, SchemaType.Date);
    this.apply(objectInitializer);
  }
}
/** a schema that represents a Char value */
export interface CharSchema extends PrimitiveSchema {
  /** the schema type  */
  type: SchemaType.Char;
}

export class CharSchema extends Schema implements CharSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<CharSchema>) {
    super(name, description, SchemaType.Char);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a ByteArray value */
export interface ByteArraySchema extends ValueSchema {
  /** the schema type  */
  type: SchemaType.ByteArray;

  /** date-time format  */
  format: 'base64url' | 'byte';
}

export class ByteArraySchema extends Schema implements ByteArraySchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ByteArraySchema>) {
    super(name, description, SchemaType.ByteArray);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a UnixTime value */
export interface UnixTimeSchema extends PrimitiveSchema {
  /** the schema type  */
  type: SchemaType.UnixTime;
}

export class UnixTimeSchema extends Schema implements UnixTimeSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<UnixTimeSchema>) {
    super(name, description, SchemaType.UnixTime);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a key-value collection */
export interface DictionarySchema<ElementType extends Schema = Schema> extends ComplexSchema {
  /** the schema type  */
  type: SchemaType.Dictionary;

  /** the element type of the dictionary. (Keys are always strings) */
  elementType: ElementType;
}

export class DictionarySchema<ElementType extends Schema = Schema> extends Schema implements DictionarySchema<ElementType>{
  constructor(name: string, description: string, elementType: ElementType, objectInitializer?: DeepPartial<DictionarySchema<ElementType>>) {
    super(name, description, SchemaType.Dictionary);
    this.elementType = elementType;

    this.apply(objectInitializer);
  }
}

/** an AND relationship between several schemas
 * 
 * @note - this expresses that the schema must be
 * all of the schema types given, which means
 * that this restricts the types to just <ObjectSchemaTypes>
 * because it does not make sense that a value can be a 'primitive'
 * and an 'object' at the same time. Nor does it make sense
 * that a value can be two primitive types at the same time.
 */
export interface AndSchema extends ComplexSchema {
  /** the schema type  */
  type: SchemaType.And;

  /** the set of schemas that this schema is composed of. */
  allOf: Array<ComplexSchema>;
}
export class AndSchema extends Schema implements AndSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<AndSchema>) {
    super(name, description, SchemaType.And);
    this.apply(objectInitializer);
  }
}


/** an OR relationship between several schemas 
 * 
 * @note - this expresses that the schema can be
 * any combination of the schema types given, which means 
 * that this restricts the types to just <ObjectSchemaTypes>
 * because it does not make sense that a value can be a 'primitive'
 * and an 'object' at the same time. Nor does it make sense
 * that a value can be two primitive types at the same time.
*/
export interface OrSchema extends ComplexSchema {
  /** the set of schemas that this schema is composed of. Every schema is optional  */
  anyOf: Array<ComplexSchema>;
}
export class OrSchema extends Schema implements OrSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<OrSchema>) {
    super(name, description, SchemaType.Or);
    this.apply(objectInitializer);
  }
}

/** an XOR relationship between several schemas 
 * 
 * @note because this indicates that the actual schema
 * can be any one of the possible types, there is no 
 * restriction on the type that it may be. (bool or object or number is ok)
*/
export interface XorSchema extends Schema {
  /** the set of schemas that this must be one and only one of. */
  oneOf: Array<Schema>;
}
export class XorSchema extends Schema implements XorSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<XorSchema>) {
    super(name, description, SchemaType.Xor);
    this.apply(objectInitializer);
  }
}


/**  a NOT relationship between schemas 
 * 
 * @fearthecowboy - I don't think we're going to impmement this. 
*/
export interface NotSchema extends Schema {
  /** the schema type  */
  type: SchemaType.Not;

  /** the schema that this may not be. */
  not: Schema;
}

