import { Extensions } from '../common/extensions';
import { Dictionary } from '@azure-tools/linq';
import { uri } from '../common/uri';
import { Language } from '../common/metadata';
import { Languages } from '../common/languages';

import { ApiVersions } from '../common/api-version';
import { Deprecation } from '../common/deprecation';
import { ChoiceSchema, StringSchema, NumberSchema } from '../common/schema';

export interface JustLanguageMetadata<TLanguage extends Language = Language> extends Extensions {
  /** per-language information for this aspect */
  language: { [key in keyof Languages]: TLanguage; };

}


/** 
 * An object representing a Server.
 * 
 * If the uri supports template substitution, then the variables are required.
 */
export interface Server<TLanguage extends Language = Language> extends JustLanguageMetadata<TLanguage> {
  url: uri;
  variables?: Array<ServerVariable<TLanguage>>;
}

/** An object representing a Server Variable for server URL template substitution. */
export interface ServerVariable<TLanguage extends Language = Language> extends JustLanguageMetadata<TLanguage> {
  /** common name of the aspect -- in OAI3 this was typically the key in the parent dictionary */
  $key: string;

  /** description of the aspect. */
  description: string;

  /** API versions that this applies to. Undefined means all versions */
  apiVersions?: ApiVersions;

  /** deprecation information -- ie, when this aspect doesn't apply and why */
  deprecated?: Deprecation;

  /** the schema for the  */
  schema: ChoiceSchema | StringSchema | NumberSchema;

  /** The default value to use for substitution, which SHALL be sent if an alternate value is not supplied. 
   * 
   * @note - this behavior is different than the Schema Object's treatment of default values, because in those cases parameter values may be optional.  */
  default: string;

  /** if the value is marked 'required'. */
  required?: boolean;
}

