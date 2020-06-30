import { Dictionary } from '../common/dictionary';
import { ExternalDocumentation } from '../common/external-docs';
import { JsonReference } from '../common/json-reference';
import { VendorExtensions } from '../common/vendor-extensions';
import { Callback } from './callback';
import { XMSExamples, XMSLongRunningOperation, XMSOData, XMSPageable, XMSRequestId } from './openapiv3';
import { CookieParameter, HeaderParameter, ParameterReference, PathParameter, QueryParameter } from './parameters';
import { RequestBody } from './request-body';
import { Responses } from './response';
import { SecurityRequirement } from './security';
import { Server } from './server';


/** 
 * Describes a single API operation on a path. 
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#operationObject
 */
export interface Operation extends VendorExtensions, XMSLongRunningOperation, XMSPageable, XMSRequestId, XMSOData, XMSExamples {
  /** A list of tags for API documentation control. Tags can be used for logical grouping of operations by resources or any other qualifier. */
  tags?: Array<string>;

  /** A short summary of what the operation does. */
  summary?: string;

  /** A verbose explanation of the operation behavior. Commonmark syntax can be used for rich text representation. */
  description?: string;

  /** Additional external documentation for this operation */
  externalDocs?: ExternalDocumentation;

  /** Unique string used to identify the operation. The id MUST be unique among all operations described in the API. Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is recommended to follow common programming naming conventions. */
  operationId?: string;

  /** A list of parameters that are applicable for this operation. If a parameter is already defined at the Path Item, the new definition will override it but can never remove it. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object's components/parameters. */
  parameters?: Array<QueryParameter | PathParameter | HeaderParameter | CookieParameter | ParameterReference>;

  /** The request body applicable for this operation. The requestBody is only supported in HTTP methods where the HTTP 1.1 specification RFC7231 has explicitly defined semantics for request bodies. In other cases where the HTTP spec is vague, requestBody SHALL be ignored by consumers. */
  requestBody?: RequestBody | JsonReference<RequestBody>;

  /** The list of possible responses as they are returned from executing this operation. */
  responses: Responses;

  /** A map of possible out-of band callbacks related to the parent operation. The key is a unique identifier for the Callback Object. Each value in the map is a Callback Object that describes a request that may be initiated by the API provider and the expected responses. The key value used to identify the callback object is an expression, evaluated at runtime, that identifies a URL to use for the callback operation.  */
  callbacks?: Dictionary<Callback | JsonReference<Callback>>;

  /** Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation. Default value is false. */
  deprecated?: boolean;

  /** A declaration of which security mechanisms can be used for this operation. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. This definition overrides any declared top-level security. To remove a top-level security declaration, an empty array can be used. */
  security?: Array<SecurityRequirement>;

  /** An alternative server array to service this operation. If an alternative server object is specified at the Path Item Object or Root level, it will be overridden by this value. */
  servers?: Array<Server>;
}