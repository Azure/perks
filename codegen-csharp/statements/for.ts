/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { indent } from '@azure-tools/codegen';
import { Expression, valueOf, ExpressionOrLiteral } from '../expression';
import { StatementPossibilities, Statements } from './statement';


export class ForStatement extends Statements {
  constructor(public initialization: Expression, public condition: ExpressionOrLiteral, public loop: Expression, statements: StatementPossibilities, objectInitializer?: Partial<ForStatement>) {
    super(statements);
    this.apply(objectInitializer);
  }
  public get implementation(): string {
    return `
for( ${valueOf(this.initialization)} ; ${valueOf(this.condition)} ; ${valueOf(this.loop)})
{
${indent(super.implementation)}
}`.trim();
  }
}


export class ForEachStatement extends Statements {
  constructor(public variable: string, public enumerable: ExpressionOrLiteral, statements: StatementPossibilities, objectInitializer?: Partial<ForStatement>) {
    super(statements);
    this.apply(objectInitializer);
  }
  public get implementation(): string {
    return `
foreach( var ${this.variable} in ${valueOf(this.enumerable)} )
{
${indent(super.implementation)}
}`.trim();
  }
}

export function For(initialization: Expression, condition: ExpressionOrLiteral, loop: Expression, statements: StatementPossibilities, objectInitializer?: Partial<ForStatement>) {
  return new ForStatement(initialization, condition, loop, statements, objectInitializer);
}


export function ForEach(variable: string, enumerable: ExpressionOrLiteral, statements: StatementPossibilities, objectInitializer?: Partial<ForStatement>) {
  return new ForEachStatement(variable, enumerable, statements, objectInitializer);
}