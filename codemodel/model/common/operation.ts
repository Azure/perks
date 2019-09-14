import { Parameter } from './parameter';
import { Response } from './response';
import { Language, Protocol, Metadata } from './metadata';
import { Aspect } from './aspect';
import { ApiVersion } from './api-version';
import { Dictionary } from '@azure-tools/linq';

/** represents a single callable endpoint with a discrete set of inputs, and any number of output possibilities (responses or exceptions)  */
export interface Operation extends Aspect {

  /** the inputs to the operation */
  parameters: Array<Parameter>;

  /** responses that indicate a successful call */
  responses: Array<Response>;

  /** responses that indicate a failed call */
  exceptions: Array<Response>;

  /** the apiVersion to use for a given profile name */
  profile: Dictionary<ApiVersion>;

}

/** an operation group represents a container around set of operations */
export interface OperationGroup extends Metadata {
  $key: string;
  operations: Array<Operation>;
}
