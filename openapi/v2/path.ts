import { HttpMethod } from '../common/http-method';
import { JsonReference } from '../common/json-reference';
import { VendorExtensions } from '../common/vendor-extensions';
import { Operation } from './operation';
import { BodyParameter, FormDataParameter, HeaderParameter, ParameterReference, PathParameter, QueryParameter } from './parameters';


export interface ParametersWithExtensions extends VendorExtensions {
  parameters?: Array<BodyParameter | FormDataParameter | QueryParameter | PathParameter | HeaderParameter | ParameterReference>;
}

/**
 * Describes the operations available on a single path. A Path Item may be empty, due to ACL constraints. The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#pathItemObject
 */
export type PathItem = {
  [method in HttpMethod]: Operation;
} & ParametersWithExtensions;


/**
 * Holds the relative paths to the individual endpoints. The path is appended to the basePath in order to construct the full URL. The Paths may be empty, due to ACL constraints.
 * 
 * Keys must either:
 * 
 * start with `/`  -- A relative path to an individual endpoint. The field name MUST begin with a slash. The path is appended to the basePath in order to construct the full URL. Path templating is allowed.
 * start with `x-` -- Vendor Extension . The field name MUST begin with x-, for example, x-internal-id. The value can be null, a primitive, an array or an object. See Vendor Extensions for further details.
 */
export interface Paths extends VendorExtensions {
  [pathName: string]: PathItem | JsonReference<PathItem>;
}
