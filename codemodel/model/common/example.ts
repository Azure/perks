import { uri } from './uri';

export interface Example {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: uri; // uriref
}