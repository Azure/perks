/** 
 * The field name MUST begin with x-, for example, x-internal-id. The value can be null, a primitive, an array or an object. 
 * 
 * While the OpenAPI Specification tries to accommodate most use cases, additional data can be added to extend the specification at certain points.
 * The extensions properties are implemented as patterned fields that are always prefixed by "x-".
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#specification-extensions
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#specification-extensions
 * */
export interface VendorExtensions {
  'x-ms-metadata'?: any;

  /** Allows extensions to the Swagger Schema. The field name MUST begin with x-, for example, x-internal-id. The value can be null, a primitive, an array or an object. */
  // [key: string]: any;
}

