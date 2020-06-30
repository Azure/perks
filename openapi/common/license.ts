import { VendorExtensions } from './vendor-extensions';


/** License information for the exposed API. */
export interface License extends VendorExtensions {

  /** The license name used for the API. */
  name: string;

  /** A URL to the license used for the API. MUST be in the format of a URL. */
  url?: string;
}
