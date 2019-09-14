import { Dictionary } from '@azure-tools/linq';
import { Extensions } from './extensions';
import { Initializer } from '@azure-tools/codegen';


export interface Discriminator extends Extensions {
  propertyName: string;
  mapping?: Dictionary<string>;
}

export class Discriminator extends Initializer implements Discriminator {
  constructor(public propertyName: string, initializer?: Partial<Discriminator>) {
    super();
    this.apply(initializer);
  }
}
