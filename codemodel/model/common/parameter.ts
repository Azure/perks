/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Value } from './value';
import { DeepPartial } from '@azure-tools/codegen';
import { Schema } from './schema';

export enum ImplementationLocation {
  /** should be exposed as a method parameter in the operation */
  Method = 'Method',

  /** should be exposed as a client parameter (not exposed in the operation directly) */
  Client = 'Client',

  /** should be used as input to constructing the context of the client (ie, 'profile') */
  Context = 'Context'
}

/** a definition of an discrete input for an operation */
export interface Parameter extends Value {
  /** suggested implementation location for this parameter */
  implementation?: ImplementationLocation;
}

export class Parameter extends Value implements Parameter {
  constructor(name: string, description: string, schema: Schema, initializer?: DeepPartial<Parameter>) {
    super(name, description, schema);

    this.apply(initializer);
  }
}

