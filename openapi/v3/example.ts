import { JsonReference } from '../common/json-reference';
import { Url } from '../common/uri';
import { VendorExtensions } from '../common/vendor-extensions';


export interface EmbeddedExample {
  /** Embedded literal example. The value field and externalValue field are mutually exclusive. To represent examples of media types that cannot naturally represented in JSON or YAML, use a string value to contain the example, escaping where necessary. */
  value: any;
}

export interface ExternalExample {
  /** A URL that points to the literal example.This provides the capability to reference examples that cannot easily be included in JSON or YAML documents.The value field and externalValue field are mutually exclusive. */
  extnernalValue: Url;
}

/** An example 
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#example-object
 */
export type Example = {
  /** Short description for the example. */
  summary?: string;

  /** Long description for the example. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
} & VendorExtensions & (EmbeddedExample | ExternalExample);

/** a choice between an example or a map of examples */
export type ExampleOrExamples = ({
  /** Example of the media type. The example SHOULD match the specified schema and encoding properties if present. Furthermore, if referencing a schema which contains an example, the example value SHALL override the example provided by the schema. To represent examples of media types that cannot naturally be represented in JSON or YAML, a string value can contain the example with escaping where necessary. */
  example: any;
} | {
  /** Examples of the media type. Each example SHOULD contain a value in the correct format as specified in the parameter encoding. Furthermore, if referencing a schema which contains an example, the examples value SHALL override the example provided by the schema. */
  [key: string]: Example | JsonReference<Example>;
});