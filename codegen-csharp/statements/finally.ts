/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { indent, DeepPartial } from '@azure-tools/codegen';
import { StatementPossibilities, Statements } from './statement';


export class FinallyStatement extends Statements {
  constructor(body: StatementPossibilities, objectInitializer?: DeepPartial<FinallyStatement>) {
    super(body);
    this.apply(objectInitializer);
  }

  public get implementation(): string {
    return `
finally
{
${indent(super.implementation)}
}`.trim();
  }
}

export function Finally(body: StatementPossibilities, objectInitializer?: DeepPartial<FinallyStatement>): FinallyStatement {
  return new FinallyStatement(body, objectInitializer);
}