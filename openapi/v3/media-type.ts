import { Dictionary } from '../common/dictionary';
import { VendorExtensions } from '../common/vendor-extensions';
import { Encoding } from './encoding';
import { ExampleOrExamples } from './example';
import { Schema, SchemaReference } from './schema';


/**
 * Each Media Type Object provides schema and examples for the media type identified by its key.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#mediaTypeObject
 */
export type MediaType = VendorExtensions & ExampleOrExamples & {
  /** The schema defining the content of the request, response, or parameter. */
  schema?: Schema | SchemaReference;

  /** A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The encoding object SHALL only apply to requestBody objects when the media type is multipart or application/x-www-form-urlencoded.  */
  encoding?: Dictionary<Encoding>;
}