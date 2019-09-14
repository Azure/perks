import { Language, Protocol, Metadata } from './metadata';
import { Schemas } from './schemas';
import { Info } from './info';
import { OperationGroup } from './operation';

export interface CodeModel<
  TLanguage extends Language = Language,
  TProtocol extends Protocol = Protocol,

  LanguageOperationGroupMetadata extends Language = Language,
  ProtocolOperationGroupMetadata extends Protocol = Protocol,

  LanguageOperationMetadata extends Language = Language,
  ProtocolOperationMetadata extends Protocol = Protocol,

  LanguageParameterMetadata extends Language = Language,
  ProtocolParameterMetadata extends Protocol = Protocol,

  LanguageResponseMetadata extends Language = Language,
  ProtocolResponseMetadata extends Protocol = Protocol
  > extends Metadata<TLanguage, TProtocol> {
  /** Code model information */
  info: Info;

  /** All schemas for the model */
  schemas: Schemas;

  /** All operations  */
  operationGroups: Array<OperationGroup<LanguageOperationGroupMetadata, ProtocolOperationGroupMetadata, LanguageOperationMetadata, ProtocolOperationMetadata, LanguageParameterMetadata, ProtocolParameterMetadata, LanguageResponseMetadata, ProtocolResponseMetadata>>;
}