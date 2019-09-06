/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { indent } from '@azure-tools/codegen';
import { StatementPossibilities, Statements } from './statement';


export class CaseStatement extends Statements {
  constructor(protected value: string, body: StatementPossibilities, objectInitializer?: Partial<CaseStatement>) {
    super(body);
    this.apply(objectInitializer);
  }

  protected get statementsImplementation(): string {
    return indent(super.implementation);
  }
  public get implementation(): string {
    return `
case ${this.value}:
{
${this.statementsImplementation}
${indent('break')};
}`.trim();
  }
}

export class DefaultCaseStatement extends CaseStatement {
  constructor(body: StatementPossibilities, objectInitializer?: Partial<DefaultCaseStatement>) {
    super('', body);
    this.apply(objectInitializer);
  }

  public get implementation(): string {
    return `
default:
{
${this.statementsImplementation}
${indent('break')};
}`.trim();
  }
}


export class TerminalDefaultCaseStatement extends CaseStatement {
  constructor(body: StatementPossibilities, objectInitializer?: Partial<TerminalDefaultCaseStatement>) {
    super('', body);
    this.apply(objectInitializer);
  }

  public get implementation(): string {
    return `
default:
{
${this.statementsImplementation}
}`.trim();
  }
}

export class TerminalCaseStatement extends CaseStatement {
  constructor(value: string, body: StatementPossibilities, objectInitializer?: Partial<TerminalCaseStatement>) {
    super(value, body);
    this.apply(objectInitializer);
  }

  public get implementation(): string {
    if (!(this.statementsImplementation.trim())) {
      return `
case ${this.value}:`.trim();
    }

    return `
case ${this.value}:
{
${this.statementsImplementation}
}`.trim();
  }
}

export function DefaultCase(body: StatementPossibilities, objectInitializer?: Partial<CaseStatement>): CaseStatement {
  return new DefaultCaseStatement(body, objectInitializer);
}

// gs01: fix this -- value should be an expresion.
export function Case(value: string, body: StatementPossibilities, objectInitializer?: Partial<CaseStatement>): CaseStatement {
  return new CaseStatement(value, body, objectInitializer);
}

export function TerminalDefaultCase(body: StatementPossibilities, objectInitializer?: Partial<CaseStatement>): TerminalDefaultCaseStatement {
  return new TerminalDefaultCaseStatement(body, objectInitializer);
}

export function TerminalCase(value: string, body: StatementPossibilities, objectInitializer?: Partial<CaseStatement>): TerminalCaseStatement {
  return new TerminalCaseStatement(value, body, objectInitializer);
}
