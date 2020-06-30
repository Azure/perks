import { JsonReference } from '../common/json-reference';
import { ExampleOrExamples } from './example';
import { MediaType } from './media-type';
import { Dictionary, XMSClientFlatten, XMSClientName, XMSParameterGrouping, XMSParameterLocation, XMSSkipUrlEncoding } from './openapiv3';
import { ParameterLocation } from './parameter-location';
import { Schema, SchemaReference } from './schema';


export interface HasSchema {
  /** The schema defining the type used for the parameter. */
  schema: Schema | SchemaReference;
}
export function hasSchema(instance: any): instance is HasSchema {
  return instance && 'schema' in instance;
}

export interface HasContent {
  /** A map containing the representations for the parameter. The key is the media type and the value describes it. The map MUST only contain one entry. */
  content: Dictionary<MediaType>;
}

export function hasContent(instance: any): instance is HasContent {
  return instance && 'content' in instance;
}

/** Schema and Content are mutually exclusive. */
export type SchemaOrContent = (HasSchema | HasContent);

/** Describes common properties between header and parameter . */
export type ParameterBase = HasSchema & {
  /**A brief description of the parameter. This could contain examples of use. CommonMark syntax MAY be used for rich text representation. */
  description?: string;

  /**Determines whether this parameter is mandatory. If the parameter location is "path", this property is REQUIRED and its value MUST be true. Otherwise, the property MAY be included and its default value is false. */
  required?: boolean;

  /** Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is false.  */
  deprecated?: boolean;

  /** When this is true, parameter values of type array or object generate separate parameters for each value of the array or key-value pair of the map. For other types of parameters this property has no effect. When style is form, the default value is true. For all other styles, the default value is false.  */
  explode?: boolean;

} & ExampleOrExamples;

export interface ParameterExtensions extends XMSSkipUrlEncoding, XMSParameterGrouping, XMSParameterLocation, XMSClientFlatten, XMSClientName { 

}

/** 
 * Describes a single operation parameter.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#parameterObject
 */
export type Parameter = ParameterBase & ParameterExtensions & {
  /**
   * The name of the parameter. Parameter names are case sensitive.
   * 
   * If in is "path", the name field MUST correspond to the associated path segment from the path field in the Paths Object. See Path Templating for further information.
   * If in is "header" and the name field is "Accept", "Content-Type" or "Authorization", the parameter definition SHALL be ignored.
   * For all other cases, the name corresponds to the parameter name used by the in property.
   */
  name: string;

  /**
   * The location of the parameter. Possible values are "query", "header", "path" or "cookie".
   */
  in: ParameterLocation;
};

/** Possible Style values for Query Parameters */
export enum QueryStyle {
  /** Form style parameters defined by RFC6570. This option replaces collectionFormat with a csv (when explode is false) or multi (when explode is true) value from OpenAPI 2.0. */
  Form = 'form',

  /** Space separated array values. This option replaces collectionFormat equal to ssv from OpenAPI 2.0. */
  SpaceDelimited = 'spaceDelimited',

  /** Pipe separated array values. This option replaces collectionFormat equal to pipes from OpenAPI 2.0. */
  PipeDelimited = 'pipeDelimited',

  /** Provides a simple way of rendering nested objects using form parameters. */
  DeepObject = 'deepObject'
}

/** A parameter set in the query string for the operation */
export type QueryParameter = Parameter & {
  /** Query Parameter */
  in: ParameterLocation.Query;

  /** Sets the ability to pass empty-valued parameters. 
   * This is valid only for query parameters and allows sending a parameter with an empty value. 
   * Default value is false. If style is used, and if behavior is n/a (cannot be serialized), the value of allowEmptyValue SHALL be ignored. Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision. 
   * 
   * @deprecated
   */
  allowEmptyValue?: boolean;

  /** Describes how the parameter value will be serialized depending on the type of the parameter value
   * 
   * @default 'form'
   */
  style: QueryStyle;

  /** Determines whether the parameter value SHOULD allow reserved characters, as defined by RFC3986 :/?#[]@!$&'()*+,;= to be included without percent-encoding. This property only applies to parameters with an in value of query. The default value is false. */
  allowReserved?: boolean;
}

/** A parameter passed in as a header value */
export type HeaderParameter = Parameter & {
  /** Header Parameter */
  in: ParameterLocation.Header;

  /** Describes how the parameter value will be serialized depending on the type of the parameter value 
   * 
   * simple - Simple style parameters defined by RFC6570. This option replaces collectionFormat with a csv value from OpenAPI 2.0
  */
  style?: 'simple';

}

/** Possible Style values for Path Parameters */
export enum PathStyle {
  /** Path-style parameters defined by RFC6570 */
  Matrix = 'matrix',

  /** Label style parameters defined by RFC6570 */
  Label = 'label',

  /** Simple style parameters defined by RFC6570. This option replaces collectionFormat with a csv value from OpenAPI 2.0. */
  Simple = 'simple'
}

/** A parameter set in the path of the operation URL */
export type PathParameter = Parameter & {
  /** PathParameter Parameter */
  in: ParameterLocation.Path;

  /** This property is REQUIRED and its value MUST be true */
  required: true;

  style?: PathStyle;
}

/** A parameter passed in as a cookie value */
export type CookieParameter = Parameter & {
  /** Cookie Parameter */
  in: ParameterLocation.Cookie;

  /** Describes how the parameter value will be serialized depending on the type of the parameter value
   * 
   * 'form' - This option replaces collectionFormat with a csv (when explode is false) or multi (when explode is true) value from OpenAPI 2.0.
   */
  style?: 'form';
}

export type ParameterReference = JsonReference<CookieParameter | HeaderParameter | PathParameter | QueryParameter>;