import { uid } from './uid';

import { Initializer } from '@azure-tools/codegen';
import { Value } from './parameter';

export interface Property extends Value {
  /** if the property is marked read-only (ie, not intended to be sent to the service) */
  readOnly?: boolean;

  /** the wire name of this property */
  serializedName: string;

  // add addtional x-ms-mutability-style-stuff 
}

export class Property extends Initializer implements Property {

  constructor(name: string, initializer?: Partial<Property>) {
    super();

    this.$key = name;
    this.serializedName = name;
    this.language = {
      default: {
        uid: `property:${uid()}`,
        description: 'MISSING DESCRIPTION 03',
        name,
      }
    };
    this.apply(initializer);
  }
}