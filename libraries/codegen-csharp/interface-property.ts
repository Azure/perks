/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Access } from './access-modifier';
import { Property } from './property';
import { TypeDeclaration } from './type-declaration';
import { docComment } from '@microsoft.azure/codegen';
import { summary } from './doc-comments';

export class InterfaceProperty extends Property {
  public getAccess = Access.Public;
  public setAccess = Access.Public;

  constructor(name: string, type: TypeDeclaration, objectInitializer?: Partial<InterfaceProperty>) {
    super(name, type);
    this.apply(objectInitializer);
  }

  public get declaration(): string {
    const get = this.getAccess === Access.Public ? 'get;' : '';
    const set = this.setAccess === Access.Public ? 'set;' : '';

    return `${docComment(summary(this.description))}
    ${this.type.declaration} ${this.name} { ${get} ${set} }`;
  }
}
