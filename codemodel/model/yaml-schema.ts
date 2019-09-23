import { Schema, Type, DEFAULT_SAFE_SCHEMA } from 'js-yaml';

import { CodeModel } from './common/code-model';
import { Metadata } from './common/metadata';
import { Parameter } from './common/parameter';
import { Property } from './common/property';
import { Value } from './common/value';
import { Operation, Request, OperationGroup } from './common/operation';
import { NumberSchema, StringSchema, ArraySchema, ObjectSchema, ChoiceSchema, ConstantSchema, BooleanSchema, ODataQuerySchema, CredentialSchema, UriSchema, UuidSchema, DurationSchema, DateTimeSchema, DateSchema, CharSchema, ByteArraySchema, UnixTimeSchema, DictionarySchema, AndSchema, OrSchema, XorSchema, ChoiceValue } from './common/schema';
import { Aspect } from './common/aspect';
import { Schemas } from './common/schemas';
import { Discriminator } from './common/discriminator';
import { ExternalDocumentation } from './common/external-documentation';
import { Contact, Info, License } from './common/info';
import { APIKeySecurityScheme, BearerHTTPSecurityScheme, ImplicitOAuthFlow, NonBearerHTTPSecurityScheme, OAuth2SecurityScheme, OAuthFlows, OpenIdConnectSecurityScheme, PasswordOAuthFlow, AuthorizationCodeOAuthFlow, ClientCredentialsFlow } from './http/security';
import { HttpServer, ServerVariable } from './http/server';
import { Languages } from './common/languages';

import { Protocols } from './common/protocols';
import { ApiVersion } from './common/api-version';
import { HttpWithBodyRequest, HttpParameter, HttpStreamRequest, HttpMultipartRequest, HttpStreamResponse, HttpRequest, HttpResponse, HttpModel } from './http/http';

function TypeInfo<U extends new (...args: any) => any>(type: U) {
  return new Type(`!${type.name}`, { kind: 'mapping', instanceOf: type, construct: (i) => Object.setPrototypeOf(i, type.prototype) });
}

export const codeModelSchema = Schema.create(DEFAULT_SAFE_SCHEMA, [
  TypeInfo(HttpModel),
  TypeInfo(HttpWithBodyRequest),
  TypeInfo(HttpParameter),
  TypeInfo(HttpRequest),
  TypeInfo(HttpStreamRequest),
  TypeInfo(HttpMultipartRequest),
  TypeInfo(HttpResponse),
  TypeInfo(HttpStreamResponse),
  TypeInfo(Parameter),
  TypeInfo(Property),
  TypeInfo(Value),
  TypeInfo(Operation),
  TypeInfo(NumberSchema),
  TypeInfo(StringSchema),
  TypeInfo(ArraySchema),
  TypeInfo(ObjectSchema),
  TypeInfo(ChoiceValue),
  new Type('!ChoiceSchema', { kind: 'mapping', instanceOf: ChoiceSchema, construct: (i) => Object.setPrototypeOf(i, ChoiceSchema.prototype) }),
  TypeInfo(ConstantSchema),
  TypeInfo(BooleanSchema),
  TypeInfo(ODataQuerySchema),
  TypeInfo(CredentialSchema),
  TypeInfo(UriSchema),
  TypeInfo(UuidSchema),
  TypeInfo(DurationSchema),
  TypeInfo(DateTimeSchema),
  TypeInfo(DateSchema),
  TypeInfo(CharSchema),
  TypeInfo(ByteArraySchema),
  TypeInfo(UnixTimeSchema),
  TypeInfo(DictionarySchema),
  TypeInfo(AndSchema),
  TypeInfo(OrSchema),
  TypeInfo(XorSchema),
  TypeInfo(Schema),
  TypeInfo(Aspect),
  TypeInfo(CodeModel),
  TypeInfo(Request),
  TypeInfo(Schemas),
  TypeInfo(Discriminator),
  TypeInfo(ExternalDocumentation),
  TypeInfo(Contact),
  TypeInfo(Info),
  TypeInfo(License),
  TypeInfo(Metadata),
  TypeInfo(OperationGroup),
  TypeInfo(APIKeySecurityScheme),
  TypeInfo(BearerHTTPSecurityScheme),
  TypeInfo(ImplicitOAuthFlow),
  TypeInfo(NonBearerHTTPSecurityScheme),
  TypeInfo(OAuth2SecurityScheme),
  TypeInfo(OAuthFlows),
  TypeInfo(OpenIdConnectSecurityScheme),
  TypeInfo(PasswordOAuthFlow),
  TypeInfo(AuthorizationCodeOAuthFlow),
  TypeInfo(ClientCredentialsFlow),
  TypeInfo(HttpServer),
  TypeInfo(ServerVariable),
  TypeInfo(Languages),
  TypeInfo(Protocols),
  TypeInfo(ApiVersion),


]);
