import { Dictionary } from '../common/dictionary';
import { JsonReference } from '../common/json-reference';
import { VendorExtensions } from '../common/vendor-extensions';
import { Header, HeaderReference } from './header';
import { HttpStatus } from './http-status';
import { Link } from './link';
import { MediaType } from './media-type';


/**
 * Describes a single response from an API Operation, including design-time, static links to operations based on the response.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#responseObject
  */
export interface Response extends VendorExtensions {
  /** A short description of the response. CommonMark syntax MAY be used for rich text representation. */
  description: string;

  /** Maps a header name to its definition. RFC7230 states header names are case insensitive. If a response header is defined with the name "Content-Type", it SHALL be ignored. */
  headers: Dictionary<Header | HeaderReference>;

  /** A map containing descriptions of potential response payloads. The key is a media type or media type range and the value describes it. For responses that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text/* */
  content?: Dictionary<MediaType>;

  /** A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for Component Objects. */
  links?: Dictionary<Link | JsonReference<Link>>;
}

/**
 * A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.
 * The documentation is not necessarily expected to cover all possible HTTP response codes because they may not be known in advance. However, documentation is expected to cover a successful operation response and any known errors.
 * The default MAY be used as a default response object for all HTTP codes that are not covered individually by the specification.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#responses-object
 */
export type Responses = {
  [status in HttpStatus | string]: Response | ResponseReference;
} & VendorExtensions;

export type ResponseReference = JsonReference<Response>;
