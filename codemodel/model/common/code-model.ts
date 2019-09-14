import { Metadata } from './metadata';
import { Schemas } from './schemas';
import { Info } from './info';
import { OperationGroup } from './operation';

export interface CodeModel extends Metadata {
  /** Code model information */
  info: Info;

  /** All schemas for the model */
  schemas: Schemas;

  /** All operations  */
  operationGroups: Array<OperationGroup>;
}