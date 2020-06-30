import { JsonReference } from '../common';
import { Dictionary } from '../common/dictionary';
import { VendorExtensions } from '../common/vendor-extensions';
import { MediaType } from './media-type';


/** 
 * Describes a single request body. 
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#request-body-object
 */
export interface RequestBody extends VendorExtensions {
  /** A brief description of the request body. This could contain examples of use. CommonMark syntax MAY be used for rich text representation. */
  description: string;

  /** The content of the request body. The key is a media type or media type range and the value describes it. For requests that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text/* */
  content: Dictionary<MediaType>;

  /** Determines if the request body is required in the request. Defaults to false. */
  required?: boolean;
}

export type RequestBodyReference = JsonReference<RequestBody>;