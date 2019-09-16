import { Metadata } from './metadata';
import { Schema } from './schema';

/** a response from a service.  */
export interface Response extends Metadata {
  /** the content returned by the service for a given operaiton */
  schema: Schema;
}
