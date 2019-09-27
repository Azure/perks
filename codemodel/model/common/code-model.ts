import { Metadata } from './metadata';
import { Schemas } from './schemas';
import { Info } from './info';
import { OperationGroup } from './operation';
import { DeepPartial, enableSourceTracking } from '@azure-tools/codegen';
import { Parameter } from './parameter';

// + ADD DISCRIMINATORS TO ALL CLASS.

/** the model that contains all the information required to generate a service api */
export interface CodeModel extends Metadata {
  /** Code model information */
  info: Info;

  /** All schemas for the model */
  schemas: Schemas;

  /** All operations  */
  operationGroups: Array<OperationGroup>;

  /** all global parameters (ie, ImplementationLocation = client ) */
  globalParameters: Array<Parameter>;
}


export class CodeModel extends Metadata implements CodeModel {
  constructor(title: string, sourceTracking = false, objectInitializer?: DeepPartial<CodeModel>) {
    super();
    // if we are enabling source tracking, then we have to use a proxied version of this
    const $this = sourceTracking ? enableSourceTracking(this) : this;

    $this.info = new Info(title);
    $this.schemas = new Schemas();
    $this.operationGroups = [];

    this.applyTo($this, objectInitializer);
  }

  getOperationGroup(group: string) {
    let result = this.operationGroups.find(each => group === each.$key);
    if (!result) {

      result = new OperationGroup(group);
      this.operationGroups.push(result);
    }
    return result;
  }
}