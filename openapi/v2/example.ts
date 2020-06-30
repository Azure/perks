/**
 *  Allows sharing examples for operation responses. 
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#exampleObject
*/
export interface Example {
  /** The name of the property MUST be one of the Operation produces values (either implicit or inherited). The value SHOULD be an example of what such a response would look like. */
  [mineType: string]: any;
}
