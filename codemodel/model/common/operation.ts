import { Parameter } from './parameter';
import { Response } from './response';
import { Metadata } from './metadata';
import { Aspect } from './aspect';
import { ApiVersion } from './api-version';
import { Dictionary } from '@azure-tools/linq';
import { DeepPartial, Initializer } from '@azure-tools/codegen';

/** represents a single callable endpoint with a discrete set of inputs, and any number of output possibilities (responses or exceptions)  */
export interface Operation extends Aspect {

  /** the inputs that are used to build the request. */
  request: Request;

  /** responses that indicate a successful call */
  responses: Array<Response>;

  /** responses that indicate a failed call */
  exceptions: Array<Response>;

  /** the apiVersion to use for a given profile name */
  profile: Dictionary<ApiVersion>;

}

export interface Request extends Metadata {
  /** the parameter inputs to the operation */
  parameters?: Array<Parameter>;
}


export class Request extends Metadata implements Request {
  constructor(initializer?: DeepPartial<Operation>) {
    super();
    this.apply(initializer);
  }

  addParameter(parameter: Parameter) {
    (this.parameters = this.parameters || []).push(parameter);
    return parameter;
  }

}
export class Operation extends Aspect implements Operation {
  constructor(public $key: string, public description: string, initializer?: DeepPartial<Operation>) {
    super($key, description);
    this.apply({
      request: new Request()
    }, initializer);
  }

  addResponse(response: Response) {
    (this.responses = this.responses || []).push(response);
    return response;
  }
  addException(exception: Response) {
    (this.exceptions = this.exceptions || []).push(exception);
    return exception;
  }
  addProfile(profileName: string, apiVersion: ApiVersion) {
    (this.profile = this.profile || {})[profileName] = apiVersion;
    return this;
  }
}

/** an operation group represents a container around set of operations */
export interface OperationGroup extends Metadata {
  $key: string;
  operations: Array<Operation>;
}

export class OperationGroup extends Initializer implements OperationGroup {
  constructor(name: string, objectInitializer?: DeepPartial<OperationGroup>) {
    super();
    this.$key = name;
    this.apply(objectInitializer);
  }

  addOperation(operation: Operation) {
    (this.operations = this.operations || []).push(operation);
    return operation;
  }
}
