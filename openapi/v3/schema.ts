import { Dictionary } from '../common/dictionary';
import { ExternalDocumentation } from '../common/external-docs';
import { JsonReference } from '../common/json-reference';
import { JsonType } from '../common/jsontype';
import { SchemaExtensions } from '../common/schema-extensions';
import { VendorExtensions } from '../common/vendor-extensions';
import { XML } from '../common/xml';
import { Discriminator } from './discriminator';


/**
 * The Schema Object allows the definition of input and output data types. These types can be objects, but also primitives and arrays. This object is an extended subset of the JSON Schema Specification Wright Draft 00.
 * 
 * For more information about the properties, see JSON Schema Core and JSON Schema Validation. Unless stated otherwise, the property definitions follow the JSON Schema.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#schemaObject
 */
export interface Schema extends VendorExtensions, SchemaExtensions {
  /**
   * This attribute is a string that provides a short description of the instance property.
   *
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-7.2
   */
  title?: string;

  /**
    * Must be strictly greater than 0.
    * A numeric instance is valid only if division by this keyword's value results in an integer.
    * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.1
    */
  multipleOf?: number;

  /**
     * Representing an inclusive upper limit for a numeric instance.
     * This keyword validates only if the instance is less than or exactly equal to "maximum".
     * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.2
     */
  maximum?: number;

  /**
   * Representing an exclusive upper limit for a numeric instance.
   * This keyword validates only if the instance is strictly less than (not equal to) to "exclusiveMaximum".
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.3
   */
  exclusiveMaximum?: number;

  /**
   * Representing an inclusive lower limit for a numeric instance.
   * This keyword validates only if the instance is greater than or exactly equal to "minimum".
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.4
   */
  minimum?: number;

  /**
   * Representing an exclusive lower limit for a numeric instance.
   * This keyword validates only if the instance is strictly greater than (not equal to) to "exclusiveMinimum".
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.5
   */
  exclusiveMinimum?: number;

  /**
   * Must be a non-negative integer.
   * A string instance is valid against this keyword if its length is less than, or equal to, the value of this keyword.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.6
   */
  maxLength?: number;

  /**
   * Must be a non-negative integer.
   * A string instance is valid against this keyword if its length is greater than, or equal to, the value of this keyword.
   * Omitting this keyword has the same behavior as a value of 0.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.7
   */
  minLength?: number;

  /**
   * Should be a valid regular expression, according to the ECMA 262 regular expression dialect.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.8
   */
  pattern?: string;
  /**
     * Must be a non-negative integer.
     * An array instance is valid against "maxItems" if its size is less than, or equal to, the value of this keyword.
     * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.11
     */
  maxItems?: number;

  /**
   * Must be a non-negative integer.
   * An array instance is valid against "maxItems" if its size is greater than, or equal to, the value of this keyword.
   * Omitting this keyword has the same behavior as a value of 0.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.12
   */
  minItems?: number;

  /**
     * If this keyword has boolean value false, the instance validates successfully.
     * If it has boolean value true, the instance validates successfully if all of its elements are unique.
     * Omitting this keyword has the same behavior as a value of false.
     * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.13
     */
  uniqueItems?: boolean;

  /**
     * Must be a non-negative integer.
     * An object instance is valid against "maxProperties" if its number of properties is less than, or equal to, the value of this keyword.
     * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.15
     */
  maxProperties?: number;

  /**
   * Must be a non-negative integer.
   * An object instance is valid against "maxProperties" if its number of properties is greater than,
   * or equal to, the value of this keyword.
   * Omitting this keyword has the same behavior as a value of 0.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.16
   */
  minProperties?: number;

  /**
    * Elements of this array must be unique.
    * An object instance is valid against this keyword if every item in the array is the name of a property in the instance.
    * Omitting this keyword has the same behavior as an empty array.
    *
    * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.17
    */
  required?: Array<string>;

  /**
    * This provides an enumeration of all possible values that are valid
    * for the instance property. This MUST be an array, and each item in
    * the array represents a possible value for the instance value. If
    * this attribute is defined, the instance value MUST be one of the
    * values in the array in order for the schema to be valid.
    *
    * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.23
    */
  enum?: Array<any>;

  /** the JSON type for the schema */
  type?: JsonType;

  /** The extending format for the previously mentioned type.  */
  format?: string;

  /**  This attribute is a string that provides a full description of the schema */
  description?: string;

  /**
    * A collection of schemas that this schema also must conform to.
    * 
    * An instance validates successfully against this keyword if it validates successfully against all schemas defined by this keyword's value.
    * 
    * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.26
    */
  allOf?: Array<Schema | SchemaReference>;

  /**
   * A collection of schemas that this schema may conform to one or more of.
   * 
   * An instance validates successfully against this keyword if it validates successfully against at least one schema defined by this keyword's value.
   * 
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.27
   */
  anyOf?: Array<Schema | SchemaReference>;

  /**
   * A collection of schemas that this schema may conform to only one of.
   * 
   * An instance validates successfully against this keyword if it validates successfully against exactly one schema defined by this keyword's value.
   * 
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.28
   */
  oneOf?: Array<Schema | SchemaReference>;

  /**
   *  An instance is valid against this keyword if it fails to validate successfully against the schema defined by this keyword.
   * @see https://tools.ietf.org/html/draft-wright-json-schema-validation-01#section-6.29
   */
  not?: Schema | SchemaReference;

  /**  This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself. */
  items?: Schema | SchemaReference;

  /**
   * This attribute is an object with property definitions that define the
   * valid values of instance object property values. When the instance
   * value is an object, the property values of the instance object MUST
   * conform to the property definitions in this object. In this object,
   * each property definition's value MUST be a schema, and the property's
   * name MUST be the name of the instance property that it defines.  The
   * instance property value MUST be valid according to the schema from
   * the property definition. Properties are considered unordered, the
   * order of the instance properties MAY be in any order.
   *
   */
  properties?: Dictionary<Property & (Schema | SchemaReference)>;

  /** indicates that additional unlisted properties can exist in this schema */
  additionalProperties?: boolean | Schema | SchemaReference;

  /**
   * Declares the value of the property that the server will use if none is provided,
   * for example a "count" to control the number of results per page might default to 100 if not supplied by the client in the request.
   *
   * @note "default" has no meaning for required parameters.) See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-6.2. Unlike JSON Schema this value MUST conform to the defined type for this parameter. 
   */
  default?: string | boolean | number | Record<string, any>;

  /** Allows sending a null value for the defined schema. Default value is false. */
  nullable?: boolean;

  /** Adds support for polymorphism. The discriminator is an object name that is used to differentiate between other schemas which may satisfy the payload description  */
  discriminator: Discriminator;


  /** Additional external documentation for this schema. */
  externalDocs?: ExternalDocumentation;

  /** A free-form property to include an example of an instance for this schema. To represent examples that cannot be naturally represented in JSON or YAML, a string value can be used to contain the example with escaping where necessary. */
  example?: any;

  /** Specifies that a schema is deprecated and SHOULD be transitioned out of usage.Default value is false. */
  deprecated?: boolean;
}

export interface Property {
  /** Relevant only for Schema "properties" definitions. Declares the property as "read only". This means that it MAY be sent as part of a response but SHOULD NOT be sent as part of the request. If the property is marked as readOnly being true and is in the required list, the required will take effect on the response only. A property MUST NOT be marked as both readOnly and writeOnly being true. Default value is false. */
  readOnly?: boolean;

  /** Relevant only for Schema "properties" definitions. Declares the property as "write only". Therefore, it MAY be sent as part of a request but SHOULD NOT be sent as part of the response. If the property is marked as writeOnly being true and is in the required list, the required will take effect on the request only. A property MUST NOT be marked as both readOnly and writeOnly being true. Default value is false. */
  writeOnly?: boolean;

  /** This MAY be used only on properties schemas. It has no effect on root schemas. Adds additional metadata to describe the XML representation of this property. */
  xml?: XML;

  /**  This attribute is a string that provides a full description of the schema */
  description?: string;
}

export type SchemaReference = JsonReference<Schema>;