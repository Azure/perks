import { Protocol } from './metadata';

/** custom extensible metadata for individual protocols (ie, HTTP, etc) */
export interface Protocols<T extends Protocol = Protocol> {
  [key: string]: T | undefined | unknown;
  http?: T;
  amqp?: T;
  mqtt?: T;
  jsonrpc?: T;
}
