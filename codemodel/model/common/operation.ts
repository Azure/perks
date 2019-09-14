import { Parameter } from './parameter';
import { Response } from './response';
import { Language, Protocol, Metadata } from './metadata';
import { Aspect } from './aspect';
import { ApiVersion } from './api-version';
import { Dictionary } from '@azure-tools/linq';

export interface Operation<
  LanguageOperationMetadata extends Language = Language,
  ProtocolOperationMetadata extends Protocol = Protocol,

  LanguageParameterMetadata extends Language = Language,
  ProtocolParameterMetadata extends Protocol = Protocol,

  LanguageResponseMetadata extends Language = Language,
  ProtocolResponseMetadata extends Protocol = Protocol> extends Aspect<LanguageOperationMetadata, ProtocolOperationMetadata> {

  /** the inputs to the operation */
  parameters: Array<Parameter<LanguageParameterMetadata, ProtocolParameterMetadata>>;

  /** responses that indicate a successful call */
  responses: Array<Response<LanguageResponseMetadata, ProtocolResponseMetadata>>;

  /** responses that indicate a failed call */
  exceptions: Array<Response<LanguageResponseMetadata, ProtocolResponseMetadata>>;

  /** the apiVersion to use for a given profile name */
  profile: Dictionary<ApiVersion>;

}

/** an operation group represents a container around set of operations */
export interface OperationGroup<
  LanguageOperationGroupMetadata extends Language = Language,
  ProtocolOperationGroupMetadata extends Protocol = Protocol,

  LanguageOperationMetadata extends Language = Language,
  ProtocolOperationMetadata extends Protocol = Protocol,

  LanguageParameterMetadata extends Language = Language,
  ProtocolParameterMetadata extends Protocol = Protocol,

  LanguageResponseMetadata extends Language = Language,
  ProtocolResponseMetadata extends Protocol = Protocol

  > extends Metadata<LanguageOperationGroupMetadata, ProtocolOperationGroupMetadata> {
  $key: string;
  operations: Array<Operation<LanguageOperationMetadata, ProtocolOperationMetadata, LanguageParameterMetadata, ProtocolParameterMetadata, LanguageResponseMetadata, ProtocolResponseMetadata>>;
}
