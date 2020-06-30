import { Dictionary } from '../common/dictionary';
import { ExternalDocumentation } from '../common/external-docs';
import { JsonReference } from '../common/json-reference';
import { JsonType } from '../common/jsontype';
import { SchemaExtensions } from '../common/schema-extensions';
import { VendorExtensions } from '../common/vendor-extensions';
import { XML } from '../common/xml';

/**
 * The Schema Object allows the definition of input and output data types. These types can be objects, but also primitives and arrays.
 * This object is based on the JSON Schema Specification Draft 4 and uses a predefined subset of it.
 * On top of this subset, there are extensions provided by this specification to allow for more complete documentation.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schemaObject
 */
export interface Schema extends SchemaBase {
  /** Swagger allows combining and extending model definitions using the allOf property of JSON Schema, in effect offering model composition.
   * allOf takes in an array of object definitions that are validated independently but together compose a single object.
   * While composition offers model extensibility, it does not imply a hierarchy between the models.
   * To support polymorphism, Swagger adds the support of the discriminator field.
   * When used, the discriminator will be the name of the property used to decide which schema definition is used to validate the structure of the model.
   * As such, the discriminator field MUST be a required field. The value of the chosen property has to be the friendly name given to the model under the
   * definitions property. As such, inline schema definitions, which do not have a given id, cannot be used in polymorphism. */
  allOf?: Array<Schema | SchemaReference>;

  /** indicates that additional unlisted properties can exist in this schema */
  additionalProperties?: boolean | Schema | SchemaReference;

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
  properties?: Dictionary<Schema | SchemaReference>;

  /** Adds support for polymorphism. The discriminator is the schema property name that is used to differentiate between other schema that inherit this schema.
   * The property name used MUST be defined at this schema and it MUST be in the required property list. When used, the value MUST be the name of this schema
   * or any schema that inherits it. */
  discriminator?: string;

  /** Relevant only for Schema "properties" definitions. Declares the property as "read only". This means that it MAY be sent as part of a response but MUST NOT
   * be sent as part of the request. Properties marked as readOnly being true SHOULD NOT be in the required list of the defined schema. Default value is false. */
  readOnly?: boolean;

  /** This MAY be used only on properties schemas. It has no effect on root schemas. Adds Additional metadata to describe the XML representation format of this property. */
  xml?: XML;

  /** Additional external documentation for this schema. */
  externalDocs?: ExternalDocumentation;

  /** A free-form property to include an example of an instance for this schema. */
  example?: any;

  /** a list of property names that are required to be sent from the client to the server. */
  required?: Array<string>;

  /**
 * Declares the value of the property that the server will use if none is provided,
 * for example a "count" to control the number of results per page might default to 100 if not supplied by the client in the request.
 *
 * @note "default" has no meaning for required parameters.) See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-6.2. Unlike JSON Schema this value MUST conform to the defined type for this parameter. */
  default?: string | boolean | number | Record<string, any>;
}

export interface SchemaBase extends VendorExtensions, SchemaExtensions {
  /** the JSON type for the schema */
  type?: JsonType;

  /** The extending format for the previously mentioned type.  */
  format?: string;

  /** This attribute is a string that provides a short description of the schema.*/
  title?: string;

  /**  This attribute is a string that provides a full description of the schema */
  description?: string;

  /** The value of "multipleOf" MUST be a JSON number.  This number MUST be strictly greater than 0.
   * 
   * A numeric instance is valid against "multipleOf" if the result of the division of the instance by this keyword's value is an integer.
   */
  multipleOf?: number;

  /** 
   * the maximum value for the property 
   * 
   * if "exclusiveMaximum" is not present, or has boolean value false, then the instance is valid if it is lower than, or equal to, the value of "maximum";
   * 
   * if "exclusiveMaximum" has boolean value true, the instance is valid if it is strictly lower than the value of "maximum".
   */
  maximum?: number;

  /** indicates that the maximum is exclusive of the number given */
  exclusiveMaximum?: boolean;

  /** 
   * the minimum value for the property
   *
   * if "exclusiveMinimum" is not present, or has boolean value false, then the instance is valid if it is greater than, or equal to, the value of "minimum";
   *
   * if "exclusiveMinimum" has boolean value true, the instance is valid if it is strictly greater than the value of "minimum".
   */
  minimum?: number;

  /** indicates that the minimum is exclusive of the number given */
  exclusiveMinimum?: boolean;

  /** A string instance is valid against this keyword if its length is less than, or equal to, the value of this keyword. */
  maxLength?: number;

  /** A string instance is valid against this keyword if its length is greater than, or equal to, the value of this keyword. */
  minLength?: number;

  /** A string instance is considered valid if the regular expression matches the instance successfully. */
  pattern?: string;

  /**  An array instance is valid against "maxItems" if its size is less than, or equal to, the value of this keyword. */
  maxItems?: number;

  /**  An array instance is valid against "minItems" if its size is greater than, or equal to, the value of this keyword. */
  minItems?: number;

  /** if this keyword has boolean value false, the instance validates successfully.  If it has boolean value true, the instance validates successfully if all of its elements are unique. */
  uniqueItems?: boolean;

  /**  An object instance is valid against "maxProperties" if its number of properties is less than, or equal to, the value of this keyword. */
  maxProperties?: number;

  /** An object instance is valid against "minProperties" if its number of properties is greater than, or equal to, the value of this keyword.  */
  minProperties?: number;

  /** An instance validates successfully against this keyword if its value is equal to one of the elements in this keyword's array value. */
  enum?: Array<string | boolean | number | Record<string, any>>;

  /** Describes the type of items in the array.  */
  items?: Schema | JsonReference<Schema>;
}

export type SchemaReference = JsonReference<Schema>;