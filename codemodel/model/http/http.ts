import { SerializationStyle } from './SerializationStyle';
import { HttpMethod } from './HttpMethod';
import { ParameterLocation } from './ParameterLocation';
import { Protocol } from '../common/metadata';
import { StatusCode } from './status-code';
import { HttpServer } from './server';
import { SecurityRequirement } from './security';
import { Schema } from '../common/schema';
import { Request } from '../common/operation';

export enum ImplementationLocation {
  Method = 'Method',
  Client = 'Client',
}

/** extended metadata for HTTP operation parameters  */
export interface HttpParameter extends Protocol {
  /** the location that this parameter is placed in the http request */
  in: ParameterLocation;

  /** the Serialization Style used for the parameter. */
  style: SerializationStyle;

  /** when set, this indicates that the content of the parameter should not be subject to URI encoding rules. */
  skipUriEncoding?: boolean;

  /** suggested implementation location for this parameter */
  implementation: ImplementationLocation;
}

export class HttpParameter extends Protocol {

}

/** HTTP operation protocol data */
export interface HttpRequest extends Protocol {
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

  /** each method must have one or more servers that it is connected to. */
  servers: Array<HttpServer>;
}

export class HttpRequest extends Protocol {

}

export interface HttpWithBodyRequest extends HttpRequest {
  /** must set a media type for the body */
  mediaType: string;
}

export class HttpWithBodyRequest extends HttpRequest implements HttpWithBodyRequest {

}
export interface HttpStreamRequest extends HttpWithBodyRequest {
  /* indicates that the HTTP request should be a stream, not a serialized object */
  stream: true;
}

export class HttpStreamRequest extends HttpWithBodyRequest implements HttpStreamRequest {
}

export interface HttpMultiPartRequest extends HttpWithBodyRequest {
  /** indicates that the HTTP Request should be a multipart request 
   * 
   * ie, that it has multiple requests in a single request.
  */
  multipart: true;

  /** the multiple request parts that make up this request ?? is this right? */
  parts: Array<Request>;
}


export class HttpMultipartRequest extends HttpWithBodyRequest implements HttpMultiPartRequest {
  multipart = <true>true;
  parts = [];
}

export interface HttpResponse extends Protocol {
  /** the possible HTTP status codes that this response MUST match one of. */
  statusCodes: Array<StatusCode>; // oai3 supported options.

  /** the possible media types that this response MUST match one of */
  mediaTypes: Array<string>; // the response mediaTypes that this should apply to (ie, 'application/json')

  /** content returned by the service in the HTTP headers */
  headers: Array<Schema>;
}

export class HttpResponse extends Protocol implements HttpResponse {
}

export interface HttpStreamResponse extends HttpResponse {
  /** stream responses  */
  stream: true;
}

export class HttpStreamResponse extends HttpResponse implements HttpStreamResponse {
}

/** code model metadata for HTTP protocol  */
export interface HttpModel extends Protocol {
  /** a collection of server definitions for the service  */
  servers: Array<HttpServer>;

  /** a collection of security requirements for the service */
  security?: Array<SecurityRequirement>;
}

export class HttpModel extends Protocol implements HttpModel {

}
