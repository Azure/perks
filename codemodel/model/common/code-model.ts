import { Metadata } from './metadata';
import { Schemas } from './schemas';
import { Info } from './info';
import { OperationGroup } from './operation';

/** the model that contains all the information required to generate a service api */
export interface CodeModel extends Metadata {
  /** Code model information */
  info: Info;

  /** All schemas for the model */
  schemas: Schemas;

  /** All operations  */
  operationGroups: Array<OperationGroup>;
}