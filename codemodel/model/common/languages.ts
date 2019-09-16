import { Language } from './metadata';

/** custom extensible metadata for individual language generators */
export interface Languages<T extends Language = Language> {
  [key: string]: T | undefined | unknown;
  default: T;
  csharp?: T;
  python?: T;
  ruby?: T;
  go?: T;
  typescript?: T;
  javascript?: T;
  powershell?: T;
  java?: T;
  c?: T;
  cpp?: T;
  swift?: T;
  objectivec?: T;
}
