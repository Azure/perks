import { VendorExtensions } from './vendor-extensions';


/** Contact information for the exposed API.  */
export interface Contact extends VendorExtensions {
  /** The identifying name of the contact person/organization. */
  name?: string;

  /** The URL pointing to the contact information. MUST be in the format of a URL. */
  email?: string;

  /** The email address of the contact person/organization. MUST be in the format of an email address */
  url?: string;
}
