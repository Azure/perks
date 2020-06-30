import { Url } from './uri';
import { VendorExtensions } from './vendor-extensions';


/**  Allows referencing an external resource for extended documentation. */
export interface ExternalDocumentation extends VendorExtensions {

  /** The URL for the target documentation. Value MUST be in the format of a URL */
  url: Url;

  /** A short description of the target documentation. Commonmark syntax can be used for rich text representation. */
  description?: string;
}
