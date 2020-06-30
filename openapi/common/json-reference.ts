/** A JSON Pointer to a specific node in a file
 * 
 * @see https://tools.ietf.org/html/rfc6901
 */
export type JsonPointer = string;
/**
 * A simple object to allow referencing other definitions in the specification. It can be used to reference parameters and responses that are defined at the top level for reuse.
 * The Reference Object is a JSON Reference that uses a JSON Pointer as its value. For this specification, only canonical dereferencing is supported.
 */
export interface JsonReference<T> {
  /** a JSON Pointer  */
  $ref: JsonPointer;
}

export interface JsonReferenceMap<T> {
  /** a key/target mapping  */
  [key: string]: JsonPointer;
}
