import { JsonReference } from '../common/json-reference';
import { JsonType } from '../common/jsontype';
import { XMSClientFlatten, XMSClientName, XMSParameterGrouping, XMSParameterLocation, XMSSkipUrlEncoding } from '../v3/openapiv3';
import { CollectionFormat } from './collection-format';
import { ParameterLocation } from './parameter-location';
import { Schema, SchemaBase, SchemaReference } from './schema';


/** 
 * Describes a single operation parameter. 
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameter-object
*/
export interface Parameter extends XMSSkipUrlEncoding, XMSParameterGrouping, XMSParameterLocation, XMSClientFlatten,XMSClientName {
  /** 
   * The name of the parameter. Parameter names are case sensitive. 
   * If in is "path", the name field MUST correspond to the associated path segment from the path field in the Paths Object. 
   * For all other cases, the name corresponds to the parameter name used based on the in property. 
   */
  name: string;

  /** The location of the parameter. Possible values are "query", "header", "path", "formData" or "body". */
  in: ParameterLocation;

  /** 
   * Determines whether this parameter is mandatory. If the parameter is in "path", this property is required and its value MUST be true. 
   * Otherwise, the property MAY be included and its default value is false. 
   */
  required?: boolean;

  /** A brief description of the parameter. This could contain examples of use. Commonmark syntax can be used for rich text representation. */
  description?: string;

  /** 
   * Declares the value of the parameter that the server will use if none is provided, 
   * for example a "count" to control the number of results per page might default to 100 if not supplied by the client in the request. 
   * 
   * @note "default" has no meaning for required parameters.) See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-6.2. Unlike JSON Schema this value MUST conform to the defined type for this parameter. */
  default?: string | boolean | number | Record<string, any>;
}

/** A parameter that represents the body of the request */
export interface BodyParameter extends Parameter {
  /** Body Parameter */
  in: ParameterLocation.Body;

  /** The schema defining the type used for the body parameter. */
  schema?: Schema | SchemaReference;
}

/** A parameter set in the query string for the operation */
export interface QueryParameter extends Parameter, SchemaBase {
  /** Query Parameter */
  in: ParameterLocation.Query;
  /** Since the parameter is not located at the request body, it is limited to simple types (that is, not an object)
   * 
   * If type is "file", the consumes MUST be either "multipart/form-data", " application/x-www-form-urlencoded" or both and the parameter MUST be in "formData".
   */
  type: JsonType.String | JsonType.Number | JsonType.Integer | JsonType.Boolean | JsonType.Array;

  /** Sets the ability to pass empty-valued parameters.
   * 
   * Allows you to send a parameter with a name only or an empty value. Default value is false
   */
  allowEmptyValue?: boolean;
}

/** A parameter set in the path of the operation URL */
export interface PathParameter extends Parameter {
  /** Path Parameter */
  in: ParameterLocation.Path;

  /** Since the parameter is not located at the request body, it is limited to simple types (that is, not an object) */
  type: JsonType.String | JsonType.Number | JsonType.Integer | JsonType.Boolean | JsonType.Array;

  /** this property is required and its value MUST be true */
  required: true;
}

/** A parameter passed in as a header value */
export interface HeaderParameter extends Parameter {
  /** Header Parameter */
  in: ParameterLocation.Header;

  /** Since the parameter is not located at the request body, it is limited to simple types (that is, not an object) */
  type: JsonType.String | JsonType.Number | JsonType.Integer | JsonType.Boolean | JsonType.Array;
}

export interface FormDataParameter extends Parameter, SchemaBase {
  /** FormData Parameter */
  in: ParameterLocation.FormData;

  /** Since the parameter is not located at the request body, it is limited to simple types (that is, not an object) */
  type: JsonType.String | JsonType.Number | JsonType.Integer | JsonType.Boolean | JsonType.Array | JsonType.File;

  /** Determines the format of the array if type array is used.  */
  collectionFormat?: CollectionFormat;
}

export type ParameterReference = JsonReference<BodyParameter | FormDataParameter | QueryParameter | PathParameter | HeaderParameter>;


/**
 * An object to hold parameters to be reused across operations. Parameter definitions can be referenced to the ones defined here.
 * This does not define global operation parameters.
 * 
 * Keys are the name for the parameter that it defines.
 */
export interface Parameters {
  /** A map to a parameter definition, mapping a "name" to the parameter it defines. */
  [parameterName: string]: BodyParameter | FormDataParameter | QueryParameter | PathParameter | HeaderParameter;
}
