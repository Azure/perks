/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { indent, DeepPartial } from '@azure-tools/codegen';
import { Parameter } from '../parameter';
import { OneOrMoreStatements, StatementPossibilities, Statements } from './statement';

export class TryStatement extends Statements {
  constructor(body: StatementPossibilities, objectInitializer?: DeepPartial<TryStatement>) {
    super(body);
    this.apply(objectInitializer);
  }
  public get implementation(): string {
    return `
try
{
${indent(super.implementation)}
}`.trim();
  }
}

/* eslint-disable */ // is this supposed to be removed? 
export class _CatchStatement extends Statements {
  constructor(protected parameter: Parameter | undefined, body: OneOrMoreStatements, objectInitializer?: DeepPartial<TryStatement>) {
    super(body);
    this.apply(objectInitializer);
  }
  public get implementation(): string {
    const p = this.parameter ? ` (${this.parameter.declaration})` : '';
    return `
catch${p}
{
${indent(super.implementation)}
}`.trim();
  }
}

export function Try(body: StatementPossibilities, objectInitializer?: DeepPartial<TryStatement>): TryStatement {
  return new TryStatement(body, objectInitializer);
}

export function _Catch(parameter: Parameter | undefined, body: OneOrMoreStatements, objectInitializer?: DeepPartial<TryStatement>): TryStatement {
  return new _CatchStatement(parameter, body, objectInitializer);
}