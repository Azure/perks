/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Value } from './value';
import { DeepPartial } from '@azure-tools/codegen';
import { uid } from './uid';

/** a definition of an discrete input for an operation */
export interface Parameter extends Value {

}

export class Parameter extends Value implements Parameter {
  constructor(name: string, description: string, initializer?: DeepPartial<Parameter>) {
    super(name, description);

    this.language.default.uid = `parameter:${uid()}`;
    this.apply(initializer);
  }
}