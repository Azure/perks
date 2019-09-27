import { Extensions } from '../common/extensions';
import { Dictionary } from '@azure-tools/linq';
import { uri } from '../common/uri';
import { Language } from '../common/metadata';
import { Languages } from '../common/languages';

import { ApiVersions } from '../common/api-version';
import { Deprecation } from '../common/deprecation';
import { ChoiceSchema, StringSchema, NumberSchema, ValueSchema } from '../common/schema';
import { Initializer, DeepPartial } from '@azure-tools/codegen';

/** 
 * An object representing a Server.
 * 
 * If the uri supports template substitution, then the variables are required.
 */
export interface HttpServer {
  /** per-language information for this aspect */
  language: Languages;

  /** base url for the server */
  url: uri;

  /** an optional collection of variables for server templating */
  variables?: Array<ServerVariable>;
}

export class HttpServer extends Initializer implements HttpServer {
  constructor(url: uri, description: string, objectInitializer?: DeepPartial<HttpServer>) {
    super();
    this.url = url;
    this.language = {
      default: {
        name: 'server-name',
        description: description,
      }
    };
    this.apply(objectInitializer);
  }
}

/** An object representing a Server Variable for server URL template substitution. */
export interface ServerVariable {
  /** per-language information for this aspect */
  language: Languages;

  /** common name of the aspect -- in OAI3 this was typically the key in the parent dictionary */
  $key: string;

  /** description of the aspect. */
  description: string;

  /** API versions that this applies to. Undefined means all versions */
  apiVersions?: ApiVersions;

  /** deprecation information -- ie, when this aspect doesn't apply and why */
  deprecated?: Deprecation;

  /** the schema type for the server variable  */
  schema: ValueSchema;

  /** The default value to use for substitution, which SHALL be sent if an alternate value is not supplied. 
   * 
   * @note - this behavior is different than the Schema Object's treatment of default values, because in those cases parameter values may be optional.  */
  default?: string;

  /** if the value is marked 'required'. */
  required?: boolean;
}

export class ServerVariable extends Initializer implements ServerVariable {
  constructor(name: string, description: string, schema: ChoiceSchema | StringSchema | NumberSchema, objectInitializer?: DeepPartial<ServerVariable>) {
    super();
    this.$key = name;
    this.description = description;

    this.language = {
      default: {
        name,
        description,
      }
    };
    this.apply(objectInitializer);
  }
}
