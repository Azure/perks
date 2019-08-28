/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export class Exception extends Error {
  constructor(message: string, public exitCode: number = 1) {
    super(message);
    Object.setPrototypeOf(this, Exception.prototype);
  }
}

export class TypeException extends Exception {
  constructor(code: string, name: string, expectedType: string, instance?: any) {
    super(instance ? `${code} - '${name}' is not expected type '${expectedType}' (instance: '${instance}') .` : `${code} - '${name}' is not expected type '${expectedType}'.`, 1);
    Object.setPrototypeOf(this, TypeException.prototype);
  }
}

export class OperationCanceledException extends Exception {
  constructor(message: string = 'Cancelation Requested', public exitCode: number = 1) {
    super(message, exitCode);
    Object.setPrototypeOf(this, OperationCanceledException.prototype);
  }
}
export class OutstandingTaskAlreadyCompletedException extends Exception {
  constructor() {
    super('The OutstandingTaskAwaiter is already completed, may not Enter() again.', 1);
    Object.setPrototypeOf(this, OutstandingTaskAlreadyCompletedException.prototype);
  }
}

export class OperationAbortedException extends Exception {
  constructor() {
    super('Error occurred. Exiting.', 1);
    Object.setPrototypeOf(this, OperationAbortedException.prototype);
  }
}

export class AggregateException extends Exception {
  constructor(public errors: Array<any>) {
    super('Multiple Exceptions caught.', 1);
    Object.setPrototypeOf(this, AggregateException.prototype);
  }
}

export class ExclusiveLockUnavailableException extends Exception {
  constructor(resource: string, timeout: number) {
    super(`Unable to acquire exclusive lock on '${resource}' before timeout ${timeout} msec.`, 1);
    Object.setPrototypeOf(this, ExclusiveLockUnavailableException.prototype);
  }
}

export class SharedLockUnavailableException extends Exception {
  constructor(resource: string, timeout: number) {
    super(`Unable to acquire shared lock on '${resource}' before timeout ${timeout} msec.`, 1);
    Object.setPrototypeOf(this, SharedLockUnavailableException.prototype);
  }
}