/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EOL, indent, Initializer, DeepPartial } from '@azure-tools/codegen';
import { Expression, ExpressionOrLiteral, toExpression } from '../expression';
import { CaseStatement } from './case';
import { Statement } from './statement';

export type OneOrMoreCases = (() => Iterable<CaseStatement>) | Iterable<CaseStatement> | CaseStatement;

export class SwitchStatement extends Initializer implements Statement {
  protected caseStatements = new Array<CaseStatement>();

  public get implementation(): string {
    return `
switch ( ${this.expression.value} )
{
${indent(this.caseStatements.map(each => each.implementation).join(EOL))}
}`;
  }
  constructor(protected expression: Expression, cases: OneOrMoreCases, objectInitializer?: DeepPartial<SwitchStatement>) {
    super();
    this.apply(objectInitializer);
    this.add(cases);
  }
  public add(cases: OneOrMoreCases) {
    if (typeof cases === 'function') {
      cases = cases();
    }
    if (cases instanceof CaseStatement) {
      this.caseStatements.push(cases);
    } else {
      for (const caseStatement of cases) {
        this.caseStatements.push(caseStatement);
      }
    }
  }
}

export function Switch(expression: ExpressionOrLiteral, cases: OneOrMoreCases, objectInitializer?: DeepPartial<SwitchStatement>): SwitchStatement {
  return new SwitchStatement(toExpression(expression), cases, objectInitializer);
}
