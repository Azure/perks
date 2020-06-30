import { ExternalDocumentation } from './external-docs';
import { VendorExtensions } from './vendor-extensions';


/** 
 * Allows adding meta data to a single tag that is used by the Operation Object. It is not mandatory to have a Tag Object per tag used there. 
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#tag-object
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#tagObject
 * */
export interface Tag extends VendorExtensions {

  /** The name of the tag. */
  name: string;

  /** A short description for the tag. Commonmark syntax can be used for rich text representation. */
  description?: string;

  /** Additional external documentation for this tag. */
  externalDocs?: ExternalDocumentation;
}
