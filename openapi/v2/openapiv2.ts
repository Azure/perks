import { Dictionary } from '../common/dictionary';
import { ExternalDocumentation } from '../common/external-docs';
import { Info } from '../common/info';
import { XMSParameterizedHost } from '../common/schema-extensions';
import { Tag } from '../common/tag';
import { VendorExtensions } from '../common/vendor-extensions';
import { Definitions } from './definitions';
import { Parameters } from './parameters';
import { Paths } from './path';
import { Responses } from './response';
import { Schemes } from './schemes';
import { SecurityRequirement, SecurityScheme } from './security';


export interface XMSPaths {
  /** The available paths and operations for the API. (extended) */
  'x-ms-paths': Paths;
}

/** 
 * This is the root document object for the API specification 
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md
 */
export interface Model extends VendorExtensions, XMSPaths, XMSParameterizedHost {
  /** Specifies the Swagger Specification version being used. It can be used by the Swagger UI and other clients to interpret the API listing. The value MUST be "2.0". */
  swagger: '2.0';

  /** Provides metadata about the API. The metadata can be used by the clients if needed. */
  info: Info;

  /** Additional external documentation. */
  externalDocs?: ExternalDocumentation;

  /** The host (name or ip) serving the API. This MUST be the host only and does not include the scheme nor sub-paths. It MAY include a port. If the host is not included, the host serving the documentation is to be used (including the port). The host does not support path templating. */
  host?: string;

  /** The base path on which the API is served, which is relative to the host. If it is not included, the API is served directly under the host. The value MUST start with a leading slash (/). The basePath does not support path templating. */
  basePath?: string;

  /** The transfer protocol of the API. Values MUST be from the list: "http", "https", "ws", "wss". */
  schemes?: Schemes;

  /** A list of MIME types the APIs can consume. This is global to all APIs but can be overridden on specific API calls */
  consumes?: Array<string>;

  /** A list of MIME types the APIs can produce. This is global to all APIs but can be overridden on specific API calls */
  produces?: Array<string>;

  /** The available paths and operations for the API */
  paths: Paths;

  /** data types that can be consumed and produced by operations */
  definitions?: Definitions;

  /** parameters that can be used across operations */
  parameters?: Parameters;

  /** responses that can be used across operations */
  responses?: Responses;

  /** A declaration of which security schemes are applied for the API as a whole. The list of values describes alternative security schemes that can be used (that is, there is a logical OR between the security requirements). Individual operations can override this definition */
  security?: Array<SecurityRequirement>;

  /** Security scheme definitions that can be used across the specification */
  securityDefinitions?: Dictionary<SecurityScheme>;

  /** A list of tags used by the specification with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the Operation Object must be declared. The tags that are not declared may be organized randomly or based on the tools' logic. Each tag name in the list MUST be unique. */
  tags?: Array<Tag>;
}
export * from '../common/contact';
export * from '../common/dictionary';
export * from '../common/external-docs';
export * from '../common/http-method';
export * from '../common/info';
export * from '../common/json-reference';
export * from '../common/jsontype';
export * from '../common/license';
export * from '../common/tag';
export * from '../common/uri';
export * from '../common/vendor-extensions';
export * from '../common/xml';
export * from './collection-format';
export * from './definitions';
export * from './example';
export * from './header';
export * from './http-status';
export * from './operation';
export * from './parameter-location';
export * from './parameters';
export * from './path';
export * from './response';
export * from './schema';
export * from './schemes';
export * from './security';

