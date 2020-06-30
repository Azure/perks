import { Dictionary } from '../common/dictionary';
import { JsonPointer } from '../common/json-reference';
import { VendorExtensions } from '../common/vendor-extensions';
import { Server } from './server';


/**
 * Runtime expressions allow defining values based on information that will only be available within the HTTP message in an actual API call. This mechanism is used by Link Objects and Callback Objects.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#runtime-expressions
 */
export type RuntimeExpression = string;

/** the base information in a Link
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#link-object
 */
export interface LinkBase extends VendorExtensions {
  /** A map representing parameters to pass to an operation as specified with operationId or identified via operationRef. The key is the parameter name to be used, whereas the value can be a constant or an expression to be evaluated and passed to the linked operation. The parameter name can be qualified using the parameter location [{in}.]{name} for operations that use the same parameter name in different locations (e.g. path.id). */
  parameters: Dictionary<RuntimeExpression | any>;

  /** A literal value or {expression} to use as a request body when calling the target operation. */
  requestBody?: RuntimeExpression | any;

  /** A description of the link. CommonMark syntax MAY be used for rich text representation. */
  description?: string;

  /** A server object to be used by the target operation. */
  server?: Server;
}

/** a operation Link
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#link-object
 */
export type Link = {
  /** A relative or absolute reference to an OAS operation. This field is mutually exclusive of the operationId field, and MUST point to an Operation Object. Relative operationRef values MAY be used to locate an existing Operation Object in the OpenAPI definition.  */
  operationRef: JsonPointer;
} | {
  /** the name of an existing, resolvable OAS operation, as defined with a unique operationId. This field is mutually exclusive of the operationRef field. */
  operationId: string;
}
