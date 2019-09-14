import { ApiVersions } from './api-version';

export interface Deprecation {

  /** the reason why this aspect  */
  message: string;

  /** the api versions that this deprecation is applicable to. */
  apiVersions: ApiVersions;
}
