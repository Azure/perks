import { Dictionary } from '../common/dictionary';
import { Url } from '../common/uri';
import { VendorExtensions } from '../common/vendor-extensions';


/**
 * Lists the required security schemes to execute this operation. The object can have multiple security schemes declared in it which are all required (that is, there is a logical AND between the schemes).
 * 
 * The name used for each property MUST correspond to a security scheme declared in the Security Definitions.
 *
 * @see /https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#security-requirement-object
 */
export type SecurityRequirement = Dictionary<Array<string>>;

/**
 * Allows the definition of a security scheme that can be used by the operations. Supported schemes are basic authentication, an API key (either as a header or as a query parameter) and OAuth2's common flows (implicit, password, application and access code).
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#security-scheme-object
 */
export interface SecuritySchemeBase extends VendorExtensions {
  /**  The type of the security scheme. Valid values are "basic", "apiKey" or "oauth2". */
  type: 'basic' | 'apiKey' | 'oauth2';

  /** A short description for security scheme. */
  description?: string;
}

/** Basic Auth Security Scheme */
export interface BasicAuthenticationSecurityScheme extends SecuritySchemeBase {
  type: 'basic';
}

/** ApiKey Security Scheme */
export interface ApiKeySecurityScheme extends SecuritySchemeBase {
  /** ApiKey  */
  type: 'apiKey';
  /**
   * The name of the header or query parameter to be used.
   */
  name: string;

  /** The location of the API key. Valid values are "query" or "header". */
  'in': 'query' | 'header';
}

export interface OAuthSecurityBase extends SecuritySchemeBase {
  type: 'oauth2';

  /** The flow used by the OAuth2 security scheme */
  flow: 'implicit' | 'password' | 'application' | 'accessCode';

  /** The available scopes for the OAuth2 security scheme. A map between the scope name and a short description for it. */
  scopes: Dictionary<string>;
}

/** OAuth2 Implicit Security Scheme */
export interface OAuth2ImplicitSecurityScheme extends OAuthSecurityBase {
  flow: 'implicit';

  /** The authorization URL to be used for this flow. This MUST be in the form of a URL. */
  authorizationUrl: Url;
}

/** OAuth2 Password Security Scheme */
export interface OAuth2PasswordSecurityScheme extends OAuthSecurityBase {
  flow: 'password';

  /** The token URL to be used for this flow. This MUST be in the form of a URL. */
  tokenUrl: Url;
}

/** OAuth2 Application Security Scheme */
export interface OAuth2ApplicationSecurityScheme extends OAuthSecurityBase {
  flow: 'application';

  /** The token URL to be used for this flow. This MUST be in the form of a URL. */
  tokenUrl: Url;
}

/** OAuth2 Security Code Security Scheme */
export interface OAuth2AccessCodeSecurityScheme extends OAuthSecurityBase {
  flow: 'accessCode';

  /** The authorization URL to be used for this flow. This MUST be in the form of a URL. */
  authorizationUrl: Url;

  /** The token URL to be used for this flow. This MUST be in the form of a URL. */
  tokenUrl: Url;
}

/** 
 * Allows the definition of a security scheme that can be used by the operations. Supported schemes are basic authentication, an API key (either as a header or as a query parameter) and OAuth2's common flows (implicit, password, application and access code).
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#security-scheme-object
 */
export type SecurityScheme =
  BasicAuthenticationSecurityScheme |
  OAuth2AccessCodeSecurityScheme |
  OAuth2ApplicationSecurityScheme |
  OAuth2ImplicitSecurityScheme |
  OAuth2PasswordSecurityScheme |
  ApiKeySecurityScheme;
