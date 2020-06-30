import { Contact } from './contact';
import { License } from './license';
import { VendorExtensions } from './vendor-extensions';


/**
 * The object provides metadata about the API. The metadata can be used by the clients if needed, and can be presented in the Swagger-UI for convenience.
 */
export interface Info extends VendorExtensions {

  /** The title of the application. */
  title: string;

  /** Provides the version of the application API (not to be confused with the specification version). */
  version: string;

  /** A short description of the application. Commonmark syntax can be used for rich text representation. */
  description?: string;

  /** The Terms of Service for the API. */
  termsOfService?: string;

  /** The contact information for the exposed API. */
  contact?: Contact;

  /** The license information for the exposed API. */
  license?: License;
}
