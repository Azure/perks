/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Extensions } from './extensions';
import { uri } from './uri';
import { ExternalDocumentation } from './external-documentation';
import { Initializer } from '@azure-tools/codegen';

export type email = string;

export interface Contact extends Extensions {
  name?: string;
  url?: uri; // uriref
  email?: email; // email
}

export interface Info extends Extensions {
  title: string;
  description?: string;
  termsOfService?: uri; // uriref
  contact?: Contact;
  license?: License;
  version: string;

  //  tags: Array<Tag>;
  /** External Documentation  */
  externalDocs?: ExternalDocumentation;
}

export interface License extends Extensions {
  name: string;
  url?: uri; // uriref
}

export class Contact extends Initializer implements Contact {
  constructor(initializer?: Partial<Contact>) {
    super();
    this.apply(initializer);
  }
}

export class Info extends Initializer implements Info {
  constructor(public title: string, public version: string, initializer?: Partial<Info>) {
    super();
    this.apply(initializer);
  }
}

export class License extends Initializer implements License {
  constructor(public name: string, initializer?: Partial<License>) {
    super();
    this.apply(initializer);
  }
}
