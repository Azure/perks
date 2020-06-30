import { JsonReferenceMap } from '../common/json-reference';
import { Schema } from './schema';


/** 
 * The discriminator is a specific object in a schema which is used to inform the consumer of the specification of an alternative schema based on the value associated with it. 
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#discriminator-object
 */
export interface Discriminator {

  /** The name of the property in the payload that will hold the discriminator value. */
  propertyName: string;

  /** An object to hold mappings between payload values and schema names or references. */
  mapping: JsonReferenceMap<Schema>;
}