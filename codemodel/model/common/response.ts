import { Metadata } from './metadata';
import { Schema } from './schema';

/** a response from a service.  */
export interface Response extends Metadata {

}

/** a response where the content should be treated as a stream instead of a value or object */
export interface StreamResponse extends Response {
  /** indicates that this response is a stream  */
  stream: true;
}

/** a response that should be deserialized into a result of type(schema) */
export interface SchemaResponse extends Response {
  /** the content returned by the service for a given operaiton */
  schema: Schema;
}
