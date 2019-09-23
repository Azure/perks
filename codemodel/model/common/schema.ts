import { Language, Protocol, Metadata } from './metadata';
import { Aspect } from './aspect';
import { SerializationFormats } from './formats';
import { SchemaType, AllSchemaTypes, PrimitiveSchemaTypes, ObjectSchemaTypes } from './schema-type';
import { Discriminator } from './discriminator';
import { DeepPartial, } from '@azure-tools/codegen';
import { Property } from './property';
import { Dictionary } from '@azure-tools/linq';
import { Extensions } from './extensions';
import { Languages } from './languages';
import { Value } from './value';


/** language metadata specific to schema instances */
export interface SchemaMetadata extends Language {
  /** namespace of the implementation of this item */
  namespace?: string;

  /** if this is a child of a polymorphic class, this will have the value of the descriminator.  */
  discriminatorValue?: string;
}

export interface SerializationFormat extends Extensions, Dictionary<any> {

}

/** The Schema Object allows the definition of input and output data types. */
export interface Schema<TSchemaType extends SchemaType = AllSchemaTypes> extends Aspect {
  /** per-language information for Schema uses SchemaMetadata */
  language: Languages<SchemaMetadata>;

  /** the schema type  */
  type: TSchemaType;

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

export class Schema<TSchemaType extends SchemaType> extends Aspect implements Schema<TSchemaType> {
  type: TSchemaType;

  constructor(schemaName: string, description: string, type: TSchemaType, initializer?: DeepPartial<Schema>) {
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

/** returns true if the given schema is a NumberSchema */
export function isNumberSchema(schema: Schema): schema is NumberSchema {
  return schema.type === SchemaType.Number || schema.type === SchemaType.Integer;
}

/** a Schema that represents a Number value */
export interface NumberSchema extends Schema<SchemaType.Number | SchemaType.Integer> {
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

export class NumberSchema extends Schema<SchemaType.Number | SchemaType.Integer> implements NumberSchema {
  constructor(name: string, description: string, type: SchemaType.Number | SchemaType.Integer, precision: number, objectInitializer?: DeepPartial<NumberSchema>) {
    super(name, description, type);
    this.apply({ precision }, objectInitializer);
  }
}

/** a Schema that represents a string value */
export interface StringSchema extends Schema<SchemaType.String> {

  /** the maximum length of the string */
  maxLength?: number;

  /** the minimum length of the string */
  minLength?: number;

  /** a regular expression that the string must be validated against */
  pattern?: string; // regex
}

export class StringSchema extends Schema<SchemaType.String> implements StringSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<StringSchema>) {
    super(name, description, SchemaType.String);

    this.apply(objectInitializer);
  }
}

/** a Schema that represents and array of values */
export interface ArraySchema<ElementType extends Schema = Schema<AllSchemaTypes>> extends Schema<SchemaType.Array> {
  /** elementType of the array */
  elementType: ElementType;

  /** maximum number of elements in the array */
  maxItems?: number;

  /** minimum number of elements in the array */
  minItems?: number;

  /** if the elements in the array should be unique */
  uniqueItems?: boolean;
}
export class ArraySchema<ElementType extends Schema = Schema<AllSchemaTypes>> extends Schema<SchemaType.Array> implements ArraySchema<ElementType>{
  constructor(name: string, description: string, elementType: ElementType, objectInitializer?: DeepPartial<ArraySchema<ElementType>>) {
    super(name, description, SchemaType.Array);
    this.elementType = elementType;

    this.apply(objectInitializer);
  }
}

/** a schema that represents a type with child properties. */
export interface ObjectSchema extends Schema<SchemaType.Object> {
  /** the definition of the polymorphic descriminator for this type */
  discriminator?: Discriminator;

  /** the collection of properties that are in this object */
  properties?: Array<Property>;

  /**  maximum number of properties permitted */
  maxProperties?: number;

  /**  minimum number of properties permitted */
  minProperties?: number;
}

export class ObjectSchema extends Schema<SchemaType.Object> implements ObjectSchema {
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
export interface ChoiceValue {
  /** the actual value  */
  value: string | number | boolean;

  /** the name this value should use  */
  name: string;

  /** the description for this value */
  description: string;
}

export class ChoiceValue {

}

/** a schema that represents a choice of several values (ie, an 'enum') */
export interface ChoiceSchema<ChoiceType extends Schema = Schema<PrimitiveSchemaTypes>> extends Schema<SchemaType.Choice> {
  /** the primitive type for the choices */
  choiceType: ChoiceType;

  /** the possible choices for in the set */
  choices: Array<ChoiceValue>;

  /** if the set of choices is irrevocably sealed */
  sealed?: boolean;
}

export class ChoiceSchema<ChoiceType extends Schema = Schema<PrimitiveSchemaTypes>> extends Schema<SchemaType.Choice> implements ChoiceSchema<ChoiceType>{
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ChoiceSchema<ChoiceType>>) {
    super(name, description, SchemaType.Choice);
    this.apply(objectInitializer);
  }
}

/** a container for the actual constant value */
export interface ConstantValue {
  /** the actual constant value to use */
  value: any;
}

/** a schema that represents a constant value */
export interface ConstantSchema<ConstantType extends Schema = Schema<AllSchemaTypes>> extends Schema<SchemaType.Constant> {
  /** the schema type of the constant value (ie, StringSchema, NumberSchema, etc) */
  constantSchema: ConstantType;

  /** the actual constant value */
  value: Value; // QUESTION -- should this just be 'any'
}

export class ConstantSchema<ConstantType extends Schema = Schema<AllSchemaTypes>> extends Schema<SchemaType.Constant> implements ConstantSchema<ConstantType>{
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ConstantSchema<ConstantType>>) {
    super(name, description, SchemaType.Constant);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a boolean value */
export interface BooleanSchema extends Schema<SchemaType.Boolean> {

}

export class BooleanSchema extends Schema<SchemaType.Boolean> implements BooleanSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<BooleanSchema>) {
    super(name, description, SchemaType.Boolean);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a ODataQuery value */
export interface ODataQuerySchema extends Schema<SchemaType.ODataQuery> { }

export class ODataQuerySchema extends Schema<SchemaType.ODataQuery> implements ODataQuerySchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ODataQuerySchema>) {
    super(name, description, SchemaType.ODataQuery);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a Credential value */
export interface CredentialSchema extends Schema<SchemaType.Credential> {

  /** the maximum length of the string */
  maxLength?: number;

  /** the minimum length of the string */
  minLength?: number;

  /** a regular expression that the string must be validated against */
  pattern?: string; // regex
}

export class CredentialSchema extends Schema<SchemaType.Credential> implements CredentialSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<CredentialSchema>) {
    super(name, description, SchemaType.Credential);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a Uri value */
export interface UriSchema extends Schema<SchemaType.Uri> {

  /** the maximum length of the string */
  maxLength?: number;

  /** the minimum length of the string */
  minLength?: number;

  /** a regular expression that the string must be validated against */
  pattern?: string; // regex
}

export class UriSchema extends Schema<SchemaType.Uri> implements UriSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<UriSchema>) {
    super(name, description, SchemaType.Uri);
    this.apply(objectInitializer);
  }
}
/** a schema that represents a Uuid value */
export interface UuidSchema extends Schema<SchemaType.Uuid> { }

export class UuidSchema extends Schema<SchemaType.Uuid> implements UuidSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<UuidSchema>) {
    super(name, description, SchemaType.Uuid);
    this.apply(objectInitializer);
  }
}
/** a schema that represents a Duration value */
export interface DurationSchema extends Schema<SchemaType.Duration> { }

export class DurationSchema extends Schema<SchemaType.Duration> implements DurationSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<DurationSchema>) {
    super(name, description, SchemaType.Duration);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a DateTime value */
export interface DateTimeSchema extends Schema<SchemaType.DateTime> {

  /** date-time format  */
  format: 'date-time-rfc1123' | 'date-time';
}

export class DateTimeSchema extends Schema<SchemaType.DateTime> implements DateTimeSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<DateTimeSchema>) {
    super(name, description, SchemaType.DateTime);
    this.apply(objectInitializer);
  }
}
/** a schema that represents a Date value */
export interface DateSchema extends Schema<SchemaType.Date> { }

export class DateSchema extends Schema<SchemaType.Date> implements DateSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<DateSchema>) {
    super(name, description, SchemaType.Date);
    this.apply(objectInitializer);
  }
}
/** a schema that represents a Char value */
export interface CharSchema extends Schema<SchemaType.Char> { }

export class CharSchema extends Schema<SchemaType.Char> implements CharSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<CharSchema>) {
    super(name, description, SchemaType.Char);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a ByteArray value */
export interface ByteArraySchema extends Schema<SchemaType.ByteArray> {

  /** date-time format  */
  format: 'base64url' | 'byte';
}

export class ByteArraySchema extends Schema<SchemaType.ByteArray> implements ByteArraySchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<ByteArraySchema>) {
    super(name, description, SchemaType.ByteArray);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a UnixTime value */
export interface UnixTimeSchema extends Schema<SchemaType.UnixTime> { }

export class UnixTimeSchema extends Schema<SchemaType.UnixTime> implements UnixTimeSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<UnixTimeSchema>) {
    super(name, description, SchemaType.UnixTime);
    this.apply(objectInitializer);
  }
}

/** a schema that represents a key-value collection */
export interface DictionarySchema<ElementType extends Schema = Schema<AllSchemaTypes>> extends Schema<SchemaType.Dictionary> {
  /** the element type of the dictionary. (Keys are always strings) */
  elementType: ElementType;
}

export class DictionarySchema<ElementType extends Schema = Schema<AllSchemaTypes>> extends Schema<SchemaType.Dictionary> implements DictionarySchema<ElementType>{
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
export interface AndSchema extends Schema<SchemaType.And> {
  /** the set of schemas that this schema is composed of. */
  allOf: Array<Schema<ObjectSchemaTypes>>;
}
export class AndSchema extends Schema<SchemaType.And> implements AndSchema {
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
export interface OrSchema extends Schema<SchemaType.Or> {
  /** the set of schemas that this schema is composed of. Every schema is optional  */
  anyOf: Array<Schema<ObjectSchemaTypes>>;
}
export class OrSchema extends Schema<SchemaType.Or> implements OrSchema {
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
export interface XorSchema extends Schema<SchemaType.Xor> {
  /** the set of schemas that this must be one and only one of. */
  oneOf: Array<Schema>;
}
export class XorSchema extends Schema<SchemaType.Xor> implements XorSchema {
  constructor(name: string, description: string, objectInitializer?: DeepPartial<XorSchema>) {
    super(name, description, SchemaType.Xor);
    this.apply(objectInitializer);
  }
}


/**  a NOT relationship between schemas 
 * 
 * @fearthecowboy - I don't think we're going to impmement this. 
*/
export interface NotSchema extends Schema<SchemaType.Not> {
  /** the schema that this may not be. */
  not: Schema;
}

