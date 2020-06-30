import { ExternalDocumentation } from '../common/external-docs';
import { Info } from '../common/info';
import { Tag } from '../common/tag';
import { VendorExtensions } from '../common/vendor-extensions';
import { Components } from './components';
import { Paths } from './path';
import { SecurityRequirement } from './security';
import { Server } from './server';


export type Versions = '3.0.0' | '3.0.1' | '3.1.0';


export interface XMSPaths {
  /** The available paths and operations for the API. (extended) */
  'x-ms-paths': Paths;
}
/** 
 * This is the root document object for the API specification 
 *  
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md
 */
export interface Model extends VendorExtensions, XMSPaths {
  /** The available paths and operations for the API. */
  paths: Paths;

  /** his string MUST be the semantic version number of the OpenAPI Specification version that the OpenAPI document uses. The openapi field SHOULD be used by tooling specifications and clients to interpret the OpenAPI document. This is not related to the API info.version string. */
  openapi: Versions;

  /**  Provides metadata about the API. The metadata MAY be used by tooling as required. */
  info: Info;

  /** Additional external documentation. */
  externalDocs?: ExternalDocumentation;

  /** An array of Server Objects, which provide connectivity information to a target server. If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of /. */
  servers?: Array<Server>;

  /** A declaration of which security mechanisms can be used across the API. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. Individual operations can override this definition. */
  security?: Array<SecurityRequirement>;

  /** A list of tags used by the specification with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the Operation Object must be declared. The tags that are not declared MAY be organized randomly or based on the tools' logic. Each tag name in the list MUST be unique. */
  tags?: Array<Tag>;

  /** An element to hold various schemas for the specification. */
  components?: Components;
}

export * from '../common/common';
export * from './callback';
export * from './components';
export * from './discriminator';
export * from './encoding';
export * from './example';
export * from './header';
export * from './http-status';
export * from './link';
export * from './media-type';
export * from './openapiv3';
export * from './operation';
export * from './parameter-location';
export * from './parameters';
export * from './path';
export * from './request-body';
export * from './response';
export * from './schema';
export * from './security';
export * from './server';

