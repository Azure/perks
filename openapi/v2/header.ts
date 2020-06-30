import { JsonType } from '../common/jsontype';
import { XMSClientRequestId } from '../v3/openapiv3';
import { SchemaBase } from './schema';


/** 
 * Represents a header declaration  
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#header-object
*/
export interface Header extends SchemaBase, XMSClientRequestId {
  /** 	Required. The type of the object. The value MUST be one of "string", "number", "integer", "boolean", or "array". */
  type: JsonType.String | JsonType.Number | JsonType.Integer | JsonType.Boolean | JsonType.Array;
}
