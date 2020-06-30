import { JsonReference } from '../common/json-reference';
import { XMSClientRequestId } from './openapiv3';
import { ParameterBase } from './parameters';


/**
 * The Header Object follows the structure of the Parameter Object with the following changes:
 * 
 * name MUST NOT be specified, it is given in the corresponding headers map.
 * in MUST NOT be specified, it is implicitly in header.
 * All traits that are affected by the location MUST be applicable to a location of header (for example, style).
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#header-object
 */
export type Header = ParameterBase &  XMSClientRequestId & {
  /** Describes how the parameter value will be serialized depending on the type of the parameter value 
  * 
  * simple - Simple style parameters defined by RFC6570. This option replaces collectionFormat with a csv value from OpenAPI 2.0
 */
  style?: 'simple';
}

/** a JSON Reference to a Header */
export type HeaderReference = JsonReference<Header>;