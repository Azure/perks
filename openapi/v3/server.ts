import { Dictionary } from '../common/dictionary';
import { Url } from '../common/uri';
import { VendorExtensions } from '../common/vendor-extensions';


/** 
 * An object representing a Server Variable for server URL template substitution 
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#server-variable-object
 * */
export interface ServerVariable extends VendorExtensions {
  /** An enumeration of string values to be used if the substitution options are from a limited set. */
  enum?: Array<string>;

  /** The default value to use for substitution, which SHALL be sent if an alternate value is not supplied. Note this behavior is different than the Schema Object's treatment of default values, because in those cases parameter values are optional. */
  default: string;

  /** An optional description for the server variable. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
}

/**
 * An object representing a Server.
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#server-object
 */
export interface Server extends VendorExtensions {
  /**  A URL to the target host. This URL supports Server Variables and MAY be relative, to indicate that the host location is relative to the location where the OpenAPI document is being served. Variable substitutions will be made when a variable is named in {brackets}. */
  url: Url;

  /** 	An optional string describing the host designated by the URL. CommonMark syntax MAY be used for rich text representation. */
  description?: string;

  /** A map between a variable name and its value. The value is used for substitution in the server's URL template.  */
  variables?: Dictionary<ServerVariable>;
}