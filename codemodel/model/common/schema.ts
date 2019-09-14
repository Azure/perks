import { Language, Protocol, Metadata } from './metadata';
import { Aspect } from './aspect';
import { Formats } from './formats';
import { SchemaType, AllSchemaTypes, PrimitiveSchemaTypes, ObjectSchemaTypes } from './schema-type';
import { Discriminator } from './discriminator';
import { DeepPartial, Initializer, } from '@azure-tools/codegen';
import { Property } from './property';


import { Dictionary } from '@azure-tools/linq';
import { Extensions } from './extensions';
import { Languages } from './languages';


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
  language: { [key in keyof Languages]: SchemaMetadata; };

  /** the schema type  */
  type: TSchemaType;

  /** sub-type information */
  format?: string;

  /* short description */
  summary?: string;

  /** example information  */
  example?: any;

  /** If the value isn't sent on the wire, the service will assume this */
  defaultValue?: any;

  /** per-serialization information for this Schema  */
  serialization: { [key in keyof Formats]: SerializationFormat; };

  /* are these needed I don't think so? */
  // nullable: boolean;
  // readOnly: boolean;
  // writeOnly: boolean;
}

export class Schema<TSchemaType extends SchemaType> extends Aspect implements Schema<TSchemaType> {
  type: TSchemaType;

  constructor(name: string, description: string, type: TSchemaType, initializer?: DeepPartial<Schema>) {
    super(name, description);

    this.type = type;
    // this.allOf = (this.allOf || [] ).push( schema );
    this.apply({
      language: {
        default: {
        }
      }
    });

    this.apply(initializer);
  }
}

/** returns true if the given schema is a NumberSchema */
export function isNumberSchema(schema: Schema): schema is NumberSchema {
  return schema.type === SchemaType.Number || schema.type === SchemaType.Integer;
}

/** a Schema that represents a Number value */
export interface NumberSchema extends Schema<SchemaType.Number | SchemaType.Integer> {
  /* number restrictions */
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
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

/** a Schema that represents and array of values */
export interface ArraySchema<ElementType extends Schema = Schema<AllSchemaTypes>> extends Schema<SchemaType.Array> {
  /** elementType of the array */
  elementType: ElementType;

  /* array restrictions */

  /** maximum number of elements in the array */
  maxItems?: number;

  /** minimum number of elements in the array */
  minItems?: number;

  /** if the elements in the array should be unique */
  uniqueItems?: boolean;
}

export interface ObjectSchema extends Schema<SchemaType.Object> {
  discriminator?: Discriminator;
  properties?: Array<Property>;

  /* object restrictions */
  maxProperties?: number;
  minProperties?: number;
}

export interface ChoiceSchema<ChoiceType extends Schema = Schema<PrimitiveSchemaTypes>> extends Schema<SchemaType.Choice> {
  choiceType: ChoiceType;

  choices: Array<string>;
}

export interface ConstantSchema<ConstantType extends Schema = Schema<AllSchemaTypes>> extends Schema<SchemaType.Constant> {
  constantSchema: ConstantType;
}

export interface BooleanSchema extends Schema<SchemaType.Boolean> {

}

export interface DictionarySchema<ElementType extends Schema = Schema<AllSchemaTypes>> extends Schema<SchemaType.Dictionary> {
  elementType: ElementType;
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
  allOf: Array<Schema<ObjectSchemaTypes>>;
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
  anyOf: Array<Schema<ObjectSchemaTypes>>;
}

/** an XOR relationship between several schemas 
 * 
 * @note because this indicates that the actual schema
 * can be any one of the possible types, there is no 
 * restriction on the type that it may be. (bool or object or number is ok)
*/
export interface XorSchema extends Schema<SchemaType.Xor> {
  oneOf: Array<Schema>;
}

/** a NOT relationship between schemas */
export interface NotSchema extends Schema<SchemaType.Not> {
  not: Schema;
}

