/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Language, Protocol } from './metadata';
import { Aspect } from './aspect';
import { Schema } from './schema';

export type ParameterDetails = Language;

export interface Value<L extends Language = Language, P extends Protocol = Protocol> extends Aspect<L, P> {
  /** the schema of this Value */
  schema: Schema;

  /** if the value is marked 'required'. */
  required?: boolean;

  /** can null be passed in instead  */
  nullable?: boolean;
}

export interface Parameter<L extends Language = Language, P extends Protocol = Protocol> extends Value<L, P> {

}