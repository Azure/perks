import { Dictionary } from '@azure-tools/linq';
import { Extensions } from './extensions';
import { Languages } from './languages';
import { Protocols } from './protocols';

export enum ImplementationLocation {
  Method = 'Method',
  Client = 'Client',
}

export interface Metadata<TLanguage extends Language = Language, TProtocol extends Protocol = Protocol> extends Extensions {
  /** per-language information for this aspect */
  language: { [key in keyof Languages]: TLanguage; };

  /** per-protocol information for this aspect  */
  protocol: { [key in keyof Protocols]: TProtocol; };
}

export interface Language extends Dictionary<any> {
  /** name used in actual implementation */
  name: string;

  /** description text - describes this node. */
  description: string;
}

export interface Protocol extends Dictionary<any> {
}
