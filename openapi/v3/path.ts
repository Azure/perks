import { HttpMethod } from '../common/http-method';
import { JsonReference } from '../common/json-reference';
import { VendorExtensions } from '../common/vendor-extensions';
import { Dictionary } from './openapiv3';
import { Operation } from './operation';
import { CookieParameter, HeaderParameter, ParameterReference, PathParameter, QueryParameter } from './parameters';
import { Server } from './server';


/** Path item contents */
export interface PathItemBase extends VendorExtensions {
  /** An alternative server array to service all operations in this path. */
  servers?: Array<Server>;

  /** An optional, string summary, intended to apply to all operations in this path. */
  summary?: string;

  /** An optional, string description, intended to apply to all operations in this path. CommonMark syntax MAY be used for rich text representation. */
  description?: string;

  /** A list of parameters that are applicable for the operations on this path */
  parameters?: Array<QueryParameter | PathParameter | HeaderParameter | CookieParameter | ParameterReference>;
}

/** 
 * Describes the operations available on a single path. A Path Item MAY be empty, due to ACL constraints. The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#tagObject
 */
export type PathItem = {
  /** A list of parameters that are applicable for all the operations described under this path. These parameters can be overridden at the operation level, but cannot be removed there. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object's components/parameters. */
  [method in HttpMethod]: Operation;
} & PathItemBase;


/**
 * Holds the relative paths to the individual endpoints. The path is appended to the basePath in order to construct the full URL. The Paths may be empty, due to ACL constraints.
 * 
 * Keys must either:
 * 
 * start with `/`  -- A relative path to an individual endpoint. The field name MUST begin with a slash. The path is appended to the basePath in order to construct the full URL. Path templating is allowed.
 * start with `x-` -- Vendor Extension . The field name MUST begin with x-, for example, x-internal-id. The value can be null, a primitive, an array or an object. See Vendor Extensions for further details.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#paths-object
 */
export interface Paths extends VendorExtensions, Dictionary<PathItem | JsonReference<PathItem>> {

}
