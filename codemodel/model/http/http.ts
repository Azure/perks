import { SerializationStyle } from './SerializationStyle';
import { HttpMethod } from './HttpMethod';
import { ParameterLocation } from './ParameterLocation';
import { Protocol } from '../common/metadata';
import { StatusCode } from './status-code';
import { Server } from './server';
import { SecurityRequirement } from './security';
import { Schema } from '../common/schema';

export enum ImplementationLocation {
  Method = 'Method',
  Client = 'Client',
}

/** extended metadata for HTTP operation parameters  */
export interface ParameterMetadata extends Protocol {
  /** the location that this parameter is placed in the http request */
  in: ParameterLocation;

  /** the Serialization Style used for the parameter. */
  style: SerializationStyle;

  /** when set, this indicates that the content of the parameter should not be subject to URI encoding rules. */
  skipUriEncoding?: boolean;

  /** suggested implementation location for this parameter */
  implementation: ImplementationLocation;
}

/** HTTP operation protocol data */
export interface OperationMetadata extends Protocol {
  /** A relative path to an individual endpoint. 
   * 
   * The field name MUST begin with a slash. 
   * The path is appended (no relative URL resolution) to the expanded URL from the Server Object's url field in order to construct the full URL. 
   * Path templating is allowed. 
   * 
   * When matching URLs, concrete (non-templated) paths would be matched before their templated counterparts.  */
  path: string;

  /** the HTTP Method used to process this operation */
  method: HttpMethod;

  baseUrl: string; //? 

}

export interface ResponseMetadata extends Protocol {
  /** the possible HTTP status codes that this response MUST match one of. */
  statusCodes: Array<StatusCode>; // oai3 supported options.

  /** the possible media types that this response MUST match one of */
  mediaTypes: Array<string>; // the response mediaTypes that this should apply to (ie, 'application/json')

  /** content returned by the service in the HTTP headers */
  headers: Array<Schema>;


}

/** code model metadata for HTTP protocol  */
export interface ModelMetadata extends Protocol {
  /** a collection of server definitions for the service  */
  servers: Array<Server>;

  /** a collection of security requirements for the service */
  security?: Array<SecurityRequirement>;
}

